import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'

/**
 * TossPayments 웹훅 핸들러
 *
 * 주요 이벤트:
 * - PAYMENT_STATUS_CHANGED: 결제 상태 변경 (가상계좌 입금 등)
 * - REFUND: 환불 완료 동기화
 *
 * 참고: 일반 카드/간편결제는 /payment/success에서 동기 처리.
 * 웹훅은 가상계좌 입금 등 비동기 결제 수단에 필요.
 */

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('[TOSS_WEBHOOK] Received event', { eventType: body.eventType, createdAt: body.createdAt })

    const supabase = createAdminClient()

    // 가상계좌 입금 완료 처리
    if (body.eventType === 'PAYMENT_STATUS_CHANGED') {
      const payment = body.data

      if (!payment?.paymentKey) {
        return NextResponse.json({ received: true })
      }

      // payment_key로 주문 조회
      const { data: order } = await supabase
        .from('orders')
        .select('id, payment_status, total')
        .eq('tosspayments_payment_key', payment.paymentKey)
        .single()

      if (!order) {
        console.log('[TOSS_WEBHOOK] Order not found', { paymentKey: payment.paymentKey })
        return NextResponse.json({ received: true })
      }

      // 가상계좌 입금 완료 (DONE 상태)
      if (payment.status === 'DONE' && order.payment_status !== 'paid') {
        await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('id', order.id)

        console.log('[TOSS_WEBHOOK] Virtual account payment confirmed', { orderId: order.id })
      }

      // 취소/환불
      if (payment.status === 'CANCELED' && order.payment_status !== 'refunded') {
        const cancelAmount = payment.cancels?.reduce(
          (sum: number, c: any) => sum + (c.cancelAmount || 0),
          0
        ) || order.total

        await supabase
          .from('orders')
          .update({
            payment_status: 'refunded',
            return_status: 'refunded',
            refund_amount: cancelAmount,
            refunded_at: new Date().toISOString(),
          })
          .eq('id', order.id)

        console.log('[TOSS_WEBHOOK] Refund synced', { orderId: order.id, cancelAmount })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[TOSS_WEBHOOK] Error', err.message)
    return NextResponse.json({ received: true })
  }
}
