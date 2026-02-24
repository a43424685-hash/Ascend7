import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { sendReviewRequest } from '@/shared/lib/email'

export const runtime = 'nodejs'

/**
 * 구매 후 리뷰 요청 CRON
 * - 매일 오전 10시 KST (0 1 * * * UTC) 실행
 * - 배송 완료(delivered) 후 5일 경과, 미발송 주문에 리뷰 요청 이메일 발송
 * - 발송 완료 후 review_request_sent_at 업데이트
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // 배송완료 + 미발송 + 5일 이상 경과 주문 조회
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      updated_at,
      order_items (
        quantity,
        product_name,
        variant_options
      )
    `)
    .eq('fulfillment_status', 'delivered')
    .eq('payment_status', 'paid')
    .is('review_request_sent_at', null)
    .lte('updated_at', fiveDaysAgo)
    .limit(50) // 한 번에 최대 50건 처리

  if (error) {
    console.error('❌ [REVIEW_CRON] DB error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ success: true, message: '발송 대상 없음', sent: 0 })
  }

  let sent = 0
  let failed = 0
  const results: Array<{ orderNumber: string; status: string }> = []

  for (const order of orders) {
    const items = (order.order_items || []).map((item: any) => ({
      name: item.product_name || '상품',
      option: item.variant_options || '',
      quantity: item.quantity || 1,
      price: '',
    }))

    const result = await sendReviewRequest({
      orderNumber: order.order_number,
      customerName: order.customer_name || '고객',
      customerEmail: order.customer_email,
      items,
    })

    if (result.success) {
      // 발송 성공 → review_request_sent_at 업데이트
      await supabase
        .from('orders')
        .update({ review_request_sent_at: new Date().toISOString() })
        .eq('id', order.id)

      sent++
      results.push({ orderNumber: order.order_number, status: 'sent' })
    } else {
      failed++
      results.push({ orderNumber: order.order_number, status: `failed: ${result.error}` })
    }
  }

  console.log(`✅ [REVIEW_CRON] 완료: 발송 ${sent}건, 실패 ${failed}건`)

  return NextResponse.json({
    success: true,
    sent,
    failed,
    results,
  })
}
