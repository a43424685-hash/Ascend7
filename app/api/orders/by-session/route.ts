import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'

/**
 * session_id로 주문 정보 조회 (성공 페이지용)
 * 최소한의 정보만 반환
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: '세션 ID가 필요합니다' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, payment_status, fulfillment_status, total, created_at')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
  }

  return NextResponse.json({
    order_number: order.order_number,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    total: order.total,
    created_at: order.created_at,
  })
}
