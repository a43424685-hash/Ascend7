import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'

/**
 * Vercel Cron Job: 실패한 Stripe 웹훅 자동 재처리
 *
 * 실행 주기: 5분마다 (vercel.json에서 설정)
 * 동작: pending 상태 + next_retry_at 지난 이벤트를 재처리
 */

export const runtime = 'nodejs'
export const maxDuration = 60 // 최대 60초

// Cron job 인증 (Vercel Cron Secret 또는 간단한 토큰)
function verifyCronAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // CRON_SECRET이 설정되지 않으면 경고하고 통과 (개발 환경)
  if (!cronSecret) {
    console.warn('⚠️ [CRON] CRON_SECRET not set, allowing request')
    return true
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 [CRON] Retry webhooks job started')

  // 인증 확인
  if (!verifyCronAuth(req)) {
    console.error('❌ [CRON] Unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // 1. 재처리 대상 조회 (pending + next_retry_at 지남 + 5개 제한)
    const now = new Date().toISOString()

    const { data: pendingEvents, error: fetchError } = await supabase
      .from('stripe_webhook_failures')
      .select('*')
      .eq('status', 'pending')
      .lte('next_retry_at', now)
      .order('next_retry_at', { ascending: true })
      .limit(5)

    if (fetchError) {
      throw new Error(`Failed to fetch pending events: ${fetchError.message}`)
    }

    if (!pendingEvents || pendingEvents.length === 0) {
      console.log('✅ [CRON] No pending events to retry')
      return NextResponse.json({ processed: 0, message: 'No pending events' })
    }

    console.log(`📋 [CRON] Found ${pendingEvents.length} events to retry`)

    const results: Array<{ eventId: string; success: boolean; error?: string }> = []

    // 2. 각 이벤트 재처리
    for (const event of pendingEvents) {
      console.log(`🔄 [CRON] Processing event ${event.event_id}`)

      // processing 상태로 변경 (중복 처리 방지)
      await supabase
        .from('stripe_webhook_failures')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', event.id)

      try {
        // 페이로드에서 세션 정보 추출
        const session = event.payload.session
        const cartItems = JSON.parse(session.metadata?.cart_items || '[]')
        const userId = session.metadata?.user_id || null

        if (cartItems.length === 0) {
          throw new Error('No cart items in payload')
        }

        // 총액 계산
        const total = cartItems.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        )

        // 배송/고객 정보
        const shippingAddress = session.shipping_details?.address
          ? {
              line1: session.shipping_details.address.line1,
              line2: session.shipping_details.address.line2,
              city: session.shipping_details.address.city,
              state: session.shipping_details.address.state,
              postal_code: session.shipping_details.address.postal_code,
              country: session.shipping_details.address.country,
            }
          : null

        const customerName =
          session.customer_details?.name || session.shipping_details?.name || null
        const customerEmail = session.customer_details?.email || null

        // 기존 주문 확인
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_session_id', session.id)
          .single()

        let orderId: string

        if (existingOrder) {
          // 기존 주문 업데이트
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              shipping_address: shippingAddress,
              customer_email: customerEmail,
              customer_name: customerName,
            })
            .eq('id', existingOrder.id)

          orderId = existingOrder.id
        } else {
          // 새 주문 생성
          const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: userId === 'guest' ? null : userId,
              payment_status: 'paid',
              fulfillment_status: 'unfulfilled',
              total,
              stripe_session_id: session.id,
              shipping_address: shippingAddress,
              customer_email: customerEmail,
              customer_name: customerName,
            })
            .select('id')
            .single()

          if (orderError || !newOrder) {
            throw new Error(`Failed to create order: ${orderError?.message}`)
          }

          orderId = newOrder.id

          // 주문 아이템 생성
          const orderItems = cartItems.map((item: any) => ({
            order_id: orderId,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price,
          }))

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

          if (itemsError) {
            throw new Error(`Failed to create order items: ${itemsError.message}`)
          }

          // 재고 차감
          for (const item of cartItems) {
            await supabase.rpc('atomic_decrement_stock', {
              p_variant_id: item.variant_id,
              p_quantity: item.quantity,
            })
          }
        }

        // 성공 - 상태 업데이트
        await supabase
          .from('stripe_webhook_failures')
          .update({
            status: 'succeeded',
            updated_at: new Date().toISOString(),
          })
          .eq('id', event.id)

        // processed_stripe_events에도 기록
        await supabase.from('processed_stripe_events').upsert({
          event_id: event.event_id,
          event_type: event.event_type,
          metadata: { order_id: orderId, retried: true },
        }, { onConflict: 'event_id' })

        console.log(`✅ [CRON] Event ${event.event_id} processed successfully`)
        results.push({ eventId: event.event_id, success: true })
      } catch (processError: any) {
        console.error(`❌ [CRON] Event ${event.event_id} failed:`, processError.message)

        // 실패 - attempts 증가, 다음 재시도 시간 설정
        const newAttempts = event.attempts + 1
        const delayMinutes = Math.pow(2, newAttempts) // 지수 백오프
        const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000)

        await supabase
          .from('stripe_webhook_failures')
          .update({
            status: newAttempts >= event.max_attempts ? 'failed' : 'pending',
            attempts: newAttempts,
            next_retry_at: nextRetryAt.toISOString(),
            error_message: processError.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', event.id)

        results.push({ eventId: event.event_id, success: false, error: processError.message })
      }
    }

    console.log('✅ [CRON] Retry job completed', { results })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json({
      processed: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    })
  } catch (error: any) {
    console.error('❌ [CRON] Job failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
