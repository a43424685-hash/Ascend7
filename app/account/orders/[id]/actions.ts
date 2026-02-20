'use server'

/**
 * 고객용 환불/반품 요청 Server Actions
 *
 * 정책:
 * - 배송 전 (unfulfilled, processing): 주문 취소 → 즉시 환불
 * - 배송 후 (shipped, delivered): 반품 요청 → 관리자 검수 후 환불
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
// import { stripe } from '@/shared/lib/stripe' // Stripe (주석처리 - TossPayments로 전환)
import { cancelTossPayment } from '@/shared/lib/tosspayments'

export type CancelResult = {
  success: boolean
  error?: string
  message?: string
}

/**
 * 주문 취소 (배송 전 - 즉시 환불)
 */
export async function cancelOrder(orderId: string, reason: string): Promise<CancelResult> {
  const supabase = await createClient()

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  // 주문 조회 (본인 확인)
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, user_id, payment_status, fulfillment_status, return_status, stripe_session_id, tosspayments_payment_key, payment_method, total')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return { success: false, error: '주문을 찾을 수 없습니다.' }
  }

  // 본인 주문만 취소 가능
  if (order.user_id !== user.id) {
    return { success: false, error: '본인의 주문만 취소할 수 있습니다.' }
  }

  // 이미 환불됨
  if (order.payment_status === 'refunded') {
    return { success: false, error: '이미 환불된 주문입니다.' }
  }

  // 배송 전인지 확인
  const isPreShipping = ['unfulfilled', 'processing'].includes(order.fulfillment_status)
  if (!isPreShipping) {
    return { success: false, error: '배송 시작 후에는 주문 취소가 불가합니다. 반품 요청을 이용해주세요.' }
  }

  // 이미 반품 진행 중
  if (order.return_status && order.return_status !== 'none') {
    return { success: false, error: '이미 반품/취소 요청이 진행 중입니다.' }
  }

  // 결제 완료 확인
  if (order.payment_status !== 'paid') {
    return { success: false, error: '결제 완료된 주문만 취소 가능합니다.' }
  }

  try {
    let refundId: string | null = null

    if (order.tosspayments_payment_key) {
      // TossPayments 환불
      const result = await cancelTossPayment(
        order.tosspayments_payment_key,
        `고객 주문 취소: ${reason}`,
        order.total
      )
      refundId = result?.cancels?.[0]?.transactionKey || order.tosspayments_payment_key
    } else if (order.stripe_session_id) {
      // Stripe 환불 (기존 주문 하위 호환)
      /*
      const { stripe } = await import('@/shared/lib/stripe')
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
      const paymentIntentId = session.payment_intent as string
      if (!paymentIntentId) return { success: false, error: 'Payment Intent를 찾을 수 없습니다.' }
      const refund = await stripe.refunds.create({ payment_intent: paymentIntentId, amount: order.total, reason: 'requested_by_customer' })
      refundId = refund.id
      */
      return { success: false, error: 'Stripe 결제 주문의 환불은 관리자에게 문의해주세요.' }
    } else {
      return { success: false, error: '결제 정보가 없습니다. 관리자에게 문의해주세요.' }
    }

    // DB 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'refunded',
        fulfillment_status: 'canceled',
        return_status: 'refunded',
        return_reason: reason,
        refund_amount: order.total,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('DB update failed after Stripe refund:', updateError)
      return { success: false, error: 'DB 업데이트 실패. 관리자에게 문의해주세요.' }
    }

    // 재고 복구
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId)

    for (const item of orderItems || []) {
      await supabase.rpc('atomic_restore_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })
    }

    revalidatePath(`/account/orders/${orderId}`)
    revalidatePath('/account')

    return { success: true, message: '주문이 취소되었습니다. 환불은 결제 수단에 따라 3-5 영업일 내에 처리됩니다.' }
  } catch (error: any) {
    console.error('Cancel order error:', error)
    return { success: false, error: error.message || '주문 취소 처리 중 오류가 발생했습니다.' }
  }
}

/**
 * 반품 요청 (배송 후 - 검수 후 환불)
 */
export async function requestReturn(orderId: string, reason: string): Promise<CancelResult> {
  const supabase = await createClient()

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  if (!reason || reason.trim().length < 10) {
    return { success: false, error: '반품 사유를 10자 이상 입력해주세요.' }
  }

  // 주문 조회 (본인 확인)
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, user_id, payment_status, fulfillment_status, return_status')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return { success: false, error: '주문을 찾을 수 없습니다.' }
  }

  // 본인 주문만
  if (order.user_id !== user.id) {
    return { success: false, error: '본인의 주문만 반품 요청할 수 있습니다.' }
  }

  // 이미 환불됨
  if (order.payment_status === 'refunded') {
    return { success: false, error: '이미 환불된 주문입니다.' }
  }

  // 결제 완료 확인
  if (order.payment_status !== 'paid') {
    return { success: false, error: '결제 완료된 주문만 반품 요청 가능합니다.' }
  }

  // 배송 후인지 확인 (shipped 또는 delivered)
  const isPostShipping = ['shipped', 'delivered'].includes(order.fulfillment_status)
  if (!isPostShipping) {
    return { success: false, error: '배송 시작 전에는 주문 취소를 이용해주세요.' }
  }

  // 이미 반품 진행 중
  if (order.return_status && order.return_status !== 'none') {
    return { success: false, error: '이미 반품 요청이 진행 중입니다.' }
  }

  // 반품 요청 등록
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      return_status: 'requested',
      return_reason: reason,
      return_requested_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath(`/account/orders/${orderId}`)
  revalidatePath('/account')

  return {
    success: true,
    message: '반품 요청이 접수되었습니다. 아래 반송지로 상품을 보내주시면 검수 후 환불 처리됩니다.'
  }
}

/**
 * 반품 요청 취소 (고객)
 */
export async function cancelReturnRequest(orderId: string): Promise<CancelResult> {
  const supabase = await createClient()

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  // 주문 조회
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, user_id, return_status')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return { success: false, error: '주문을 찾을 수 없습니다.' }
  }

  // 본인 주문만
  if (order.user_id !== user.id) {
    return { success: false, error: '본인의 주문만 취소할 수 있습니다.' }
  }

  // requested 상태에서만 취소 가능
  if (order.return_status !== 'requested') {
    return { success: false, error: '반품 요청 상태에서만 취소 가능합니다.' }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      return_status: 'none',
      return_reason: null,
      return_requested_at: null,
    })
    .eq('id', orderId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath(`/account/orders/${orderId}`)
  revalidatePath('/account')

  return { success: true, message: '반품 요청이 취소되었습니다.' }
}
