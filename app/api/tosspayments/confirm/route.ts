import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { confirmTossPayment } from '@/shared/lib/tosspayments'
import { sendOrderConfirmation } from '@/shared/lib/email'
import { sendOrderConfirmAlimtalk } from '@/shared/lib/solapi'
import { formatPrice } from '@/shared/lib/utils'
import { earnPointsForOrder } from '@/features/points/actions/earn-points'
import { fetchEmailOrderData } from '@/shared/lib/order-email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount } = await req.json()

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json(
      { error: 'paymentKey, orderId, amount는 필수입니다.' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // 주문 조회 (이후 단계에서 필요한 모든 컬럼을 한 번에)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, payment_status, total, tosspayments_payment_key, customer_email, customer_name, order_number, user_id, coupon_code')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
  }

  // 멱등성: 이미 결제 완료된 경우 바로 성공 반환
  if (order.payment_status === 'paid') {
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      total: order.total,
    })
  }

  // 금액 검증 (TossPayments 요구사항 - 위변조 방지)
  if (order.total !== amount) {
    console.error('[TOSS_CONFIRM] Amount mismatch', {
      orderId,
      expected: order.total,
      received: amount,
    })
    return NextResponse.json(
      { error: '결제 금액이 일치하지 않습니다.' },
      { status: 400 }
    )
  }

  try {
    // 1. TossPayments 결제 최종 승인
    console.log('[TOSS_CONFIRM] Confirming payment', { orderId, paymentKey, amount })
    await confirmTossPayment(paymentKey, orderId, amount)
    console.log('[TOSS_CONFIRM] Payment confirmed', { orderId })

    // 2. 주문 상태 업데이트 (paid + payment_key 저장)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        tosspayments_payment_key: paymentKey,
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[TOSS_CONFIRM] DB update failed', updateError)
      // 결제는 승인됐으나 DB 실패 - 관리자 확인 필요
      return NextResponse.json(
        { error: `결제 승인은 완료됐으나 DB 업데이트 실패. PaymentKey: ${paymentKey}` },
        { status: 500 }
      )
    }

    // 3. 재고 차감 (원자적)
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId)

    let hasStockError = false
    for (const item of orderItems || []) {
      const { data } = await supabase.rpc('atomic_decrement_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })
      const result = data?.[0]
      if (!result?.success) {
        console.error('[TOSS_CONFIRM] Stock decrement failed', {
          variantId: item.variant_id,
          error: result?.error_message,
        })
        hasStockError = true
      }
    }

    if (hasStockError) {
      // 재고 부족 시 주문을 pending으로 되돌림 (관리자 수동 처리)
      await supabase
        .from('orders')
        .update({ fulfillment_status: 'canceled' })
        .eq('id', orderId)
      console.error('[TOSS_CONFIRM] MANUAL REVIEW REQUIRED - stock issue', { orderId })
    }

    // 4. 포인트 적립 (비동기, 실패해도 결제는 완료)
    if (!hasStockError && order.user_id) {
      try {
        await earnPointsForOrder(order.user_id, orderId, order.total)
      } catch (pointErr: any) {
        console.error('[TOSS_CONFIRM] Point earn failed (non-blocking):', pointErr.message)
      }
    }

    // 5. 이벤트 쿠폰 사용 기록 저장 (비동기, 실패해도 결제는 완료)
    if (order.user_id && order.coupon_code) {
      try {
        const { data: eventCoupon } = await supabase
          .from('events')
          .select('id')
          .eq('coupon_code', order.coupon_code)
          .eq('is_active', true)
          .single()

        if (eventCoupon) {
          await supabase
            .from('event_coupon_usages')
            .upsert(
              { event_id: eventCoupon.id, user_id: order.user_id, order_id: orderId },
              { onConflict: 'event_id,user_id', ignoreDuplicates: true }
            )
        }
      } catch (couponErr: any) {
        console.error('[TOSS_CONFIRM] Event coupon usage record failed (non-blocking):', couponErr.message)
      }
    }

    // 6. 주문 확인 이메일 발송 (비동기, 실패해도 결제는 완료)
    if (order.customer_email) {
      try {
        const emailData = await fetchEmailOrderData(supabase, orderId)
        if (emailData) await sendOrderConfirmation(emailData)
      } catch (emailErr: any) {
        console.error('[TOSS_CONFIRM] Email failed (non-blocking):', emailErr.message)
      }
    }

    // 7. 주문완료 카카오 알림톡 (회원만, 비동기)
    if (order.user_id) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', order.user_id)
          .single()

        if (profile?.phone) {
          const { data: alimtalkItems } = await supabase
            .from('order_items')
            .select('quantity, variant:variants(product:products(name))')
            .eq('order_id', orderId)

          const firstItem = (alimtalkItems || [])[0]
          const firstName = (firstItem?.variant as any)?.product?.name || '상품'
          const extraCount = (alimtalkItems || []).length - 1
          const productSummary = extraCount > 0 ? `${firstName} 외 ${extraCount}건` : firstName

          await sendOrderConfirmAlimtalk({
            to: profile.phone,
            customerName: order.customer_name || '고객',
            orderNumber: order.order_number || orderId.slice(0, 8),
            orderTotal: formatPrice(order.total),
            productSummary,
          })
        }
      } catch (alimtalkErr: any) {
        console.error('[TOSS_CONFIRM] Alimtalk failed (non-blocking):', alimtalkErr.message)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      total: order.total,
    })
  } catch (err: any) {
    console.error('[TOSS_CONFIRM] Confirm failed', { orderId, error: err.message })
    return NextResponse.json(
      { error: err.message || '결제 승인 처리 중 오류가 발생했습니다.' },
      { status: 400 }
    )
  }
}
