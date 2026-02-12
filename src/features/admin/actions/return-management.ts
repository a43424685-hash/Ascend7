'use server'

/**
 * 관리자 반품/환불 관리 Server Actions
 *
 * 정책:
 * - 배송 전: 즉시 환불 가능
 * - 배송 후: 반품 접수 → 도착 → 검수 통과 → 환불 (단계별 진행)
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import { requireAdmin } from '@/shared/lib/auth/admin'
import { stripe } from '@/shared/lib/stripe'
import {
  sendReturnRequestConfirmation,
  sendRefundConfirmation,
  type EmailOrderData,
} from '@/shared/lib/email'
import { formatPrice } from '@/shared/lib/utils'

export type ReturnStatus = 'none' | 'requested' | 'received' | 'approved' | 'rejected' | 'refunded'

export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'canceled'

// 이메일용 주문 데이터 조회 헬퍼
async function fetchEmailOrderData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  extra?: Partial<EmailOrderData>
): Promise<EmailOrderData | null> {
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, customer_email, customer_name, total')
    .eq('id', orderId)
    .single()

  if (!order?.customer_email) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('quantity, price, variant:variants(color, size, product:products(name))')
    .eq('order_id', orderId)

  return {
    orderNumber: order.order_number || orderId.slice(0, 8),
    customerName: order.customer_name || '고객',
    customerEmail: order.customer_email,
    total: formatPrice(order.total),
    items: (items || []).map((item: any) => {
      const v = Array.isArray(item.variant) ? item.variant[0] : item.variant
      const p = v && (Array.isArray(v.product) ? v.product[0] : v.product)
      return {
        name: p?.name || '상품',
        option: v ? `${v.color} / ${v.size}` : '-',
        quantity: item.quantity,
        price: formatPrice(item.price * item.quantity),
      }
    }),
    ...extra,
  }
}

// 상태 전이 검증 (코드 레벨)
function isValidReturnTransition(
  currentStatus: ReturnStatus,
  newStatus: ReturnStatus,
  fulfillmentStatus: FulfillmentStatus
): { valid: boolean; error?: string } {
  // 배송 전 상태
  const isPreShipping = ['unfulfilled', 'processing'].includes(fulfillmentStatus)

  // none -> requested: 언제든 가능
  if (currentStatus === 'none' && newStatus === 'requested') {
    return { valid: true }
  }

  // requested -> received: 반품 물품 도착
  if (currentStatus === 'requested' && newStatus === 'received') {
    return { valid: true }
  }

  // received -> approved: 검수 통과
  if (currentStatus === 'received' && newStatus === 'approved') {
    return { valid: true }
  }

  // received -> rejected: 검수 실패
  if (currentStatus === 'received' && newStatus === 'rejected') {
    return { valid: true }
  }

  // approved -> refunded: 환불 완료 (Stripe 호출 후)
  if (currentStatus === 'approved' && newStatus === 'refunded') {
    return { valid: true }
  }

  // 배송 전이면 즉시 환불 가능
  if (newStatus === 'refunded' && isPreShipping) {
    if (currentStatus === 'none' || currentStatus === 'requested') {
      return { valid: true }
    }
  }

  return {
    valid: false,
    error: `${currentStatus} → ${newStatus} 전이 불가 (배송상태: ${fulfillmentStatus})`
  }
}

/**
 * 반품 요청 접수
 */
export async function requestReturn(orderId: string, reason: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // 현재 주문 상태 확인
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('return_status, fulfillment_status')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: '주문을 찾을 수 없습니다.' }
    }

    const validation = isValidReturnTransition(
      order.return_status as ReturnStatus,
      'requested',
      order.fulfillment_status as FulfillmentStatus
    )

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const { error } = await supabase
      .from('orders')
      .update({
        return_status: 'requested',
        return_reason: reason,
        return_requested_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    // 반품 접수 이메일 발송
    try {
      const emailData = await fetchEmailOrderData(supabase, orderId, { returnReason: reason })
      if (emailData) await sendReturnRequestConfirmation(emailData)
    } catch (emailErr: any) {
      console.error('⚠️ [EMAIL] Return request email failed (non-blocking):', emailErr.message)
    }

    revalidatePath('/admin/orders')
    revalidatePath('/account')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 반품 물품 도착 확인
 */
export async function markReturnReceived(orderId: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('return_status, fulfillment_status')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: '주문을 찾을 수 없습니다.' }
    }

    const validation = isValidReturnTransition(
      order.return_status as ReturnStatus,
      'received',
      order.fulfillment_status as FulfillmentStatus
    )

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const { error } = await supabase
      .from('orders')
      .update({
        return_status: 'received',
        return_received_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 검수 통과 (환불 승인)
 */
export async function approveReturn(orderId: string, inspectionNotes?: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('return_status, fulfillment_status')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: '주문을 찾을 수 없습니다.' }
    }

    const validation = isValidReturnTransition(
      order.return_status as ReturnStatus,
      'approved',
      order.fulfillment_status as FulfillmentStatus
    )

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const { error } = await supabase
      .from('orders')
      .update({
        return_status: 'approved',
        return_inspection_notes: inspectionNotes || null,
        return_approved_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 검수 실패 (환불 거부)
 */
export async function rejectReturn(orderId: string, rejectionReason: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    if (!rejectionReason) {
      return { success: false, error: '거부 사유를 입력해주세요.' }
    }

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('return_status, fulfillment_status')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: '주문을 찾을 수 없습니다.' }
    }

    const validation = isValidReturnTransition(
      order.return_status as ReturnStatus,
      'rejected',
      order.fulfillment_status as FulfillmentStatus
    )

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const { error } = await supabase
      .from('orders')
      .update({
        return_status: 'rejected',
        return_rejection_reason: rejectionReason,
        return_rejected_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Stripe 환불 실행 + 상태 업데이트
 *
 * 조건:
 * - 배송 전: return_status가 none 또는 requested일 때 가능
 * - 배송 후: return_status가 approved일 때만 가능
 */
export async function processRefund(orderId: string, amount?: number) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // 주문 정보 조회
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, return_status, fulfillment_status, payment_status, stripe_session_id, total')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: '주문을 찾을 수 없습니다.' }
    }

    // 이미 환불됨
    if (order.payment_status === 'refunded') {
      return { success: false, error: '이미 환불된 주문입니다.' }
    }

    // 결제 안됨
    if (order.payment_status !== 'paid') {
      return { success: false, error: '결제 완료된 주문만 환불 가능합니다.' }
    }

    const isPreShipping = ['unfulfilled', 'processing'].includes(order.fulfillment_status)
    const returnStatus = order.return_status as ReturnStatus

    // 환불 가능 조건 검증
    if (isPreShipping) {
      // 배송 전: none 또는 requested 상태에서 환불 가능
      if (returnStatus !== 'none' && returnStatus !== 'requested') {
        return { success: false, error: `배송 전 환불은 반품요청 없거나 요청 상태에서만 가능합니다. (현재: ${returnStatus})` }
      }
    } else {
      // 배송 후: approved 상태에서만 환불 가능
      if (returnStatus !== 'approved') {
        return { success: false, error: `배송 후 환불은 검수 통과(approved) 상태에서만 가능합니다. (현재: ${returnStatus})` }
      }
    }

    // Stripe 세션에서 payment_intent 가져오기
    if (!order.stripe_session_id) {
      return { success: false, error: 'Stripe 세션 정보가 없습니다.' }
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
    const paymentIntentId = session.payment_intent as string

    if (!paymentIntentId) {
      return { success: false, error: 'Payment Intent를 찾을 수 없습니다.' }
    }

    // Stripe 환불 실행
    const refundAmount = amount || order.total
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmount, // 원 단위
      reason: 'requested_by_customer',
    })

    // DB 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'refunded',
        return_status: 'refunded',
        stripe_refund_id: refund.id,
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      // Stripe 환불은 성공했지만 DB 업데이트 실패
      console.error('DB update failed after Stripe refund:', updateError)
      return {
        success: false,
        error: `Stripe 환불은 완료되었으나 DB 업데이트 실패. Refund ID: ${refund.id}`
      }
    }

    // 환불 완료 이메일 발송
    try {
      const emailData = await fetchEmailOrderData(supabase, orderId, {
        refundAmount: formatPrice(refundAmount),
      })
      if (emailData) await sendRefundConfirmation(emailData)
    } catch (emailErr: any) {
      console.error('⚠️ [EMAIL] Refund email failed (non-blocking):', emailErr.message)
    }

    // 재고 복구 (배송 전 취소의 경우)
    if (isPreShipping) {
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
    }

    revalidatePath('/admin/orders')
    revalidatePath('/account')

    return {
      success: true,
      refundId: refund.id,
      amount: refundAmount
    }
  } catch (error: any) {
    console.error('Refund error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 반품 요청 취소 (관리자)
 */
export async function cancelReturnRequest(orderId: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('return_status')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: '주문을 찾을 수 없습니다.' }
    }

    // requested 상태에서만 취소 가능
    if (order.return_status !== 'requested') {
      return { success: false, error: '반품 요청 상태에서만 취소 가능합니다.' }
    }

    const { error } = await supabase
      .from('orders')
      .update({
        return_status: 'none',
        return_reason: null,
        return_requested_at: null,
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
