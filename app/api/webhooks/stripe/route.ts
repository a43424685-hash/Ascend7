import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/shared/lib/stripe'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { sendOrderConfirmation, type EmailOrderData } from '@/shared/lib/email'
import { formatPrice } from '@/shared/lib/utils'
import Stripe from 'stripe'

/**
 * Stripe 웹훅 핸들러 (프로덕션 안정화 버전 v2)
 *
 * 핵심 안전장치:
 * 1. 멱등성: stripe_session_id 기준 업서트 (중복 실행 안전)
 * 2. 원자적 재고 차감: Race condition 방지
 * 3. 실패 큐: 에러 발생 시 자동 재처리 대기열에 저장
 * 4. 지수 백오프: 재시도 간격 점진적 증가
 */

// 실패 큐에 저장하는 헬퍼 함수
async function saveToFailureQueue(
  supabase: ReturnType<typeof createAdminClient>,
  eventId: string,
  eventType: string,
  payload: any,
  errorMessage: string,
  attempts: number = 0
) {
  // 지수 백오프: 1분, 2분, 4분, 8분, 16분
  const delayMinutes = Math.pow(2, attempts)
  const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000)

  await supabase
    .from('stripe_webhook_failures')
    .upsert({
      event_id: eventId,
      event_type: eventType,
      payload: payload,
      error_message: errorMessage,
      attempts: attempts + 1,
      next_retry_at: nextRetryAt.toISOString(),
      status: attempts + 1 >= 5 ? 'failed' : 'pending',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'event_id',
    })

  console.log(`📥 [WEBHOOK] Saved to failure queue`, {
    eventId,
    attempts: attempts + 1,
    nextRetryAt: nextRetryAt.toISOString(),
    status: attempts + 1 >= 5 ? 'failed' : 'pending'
  })
}

// ⚠️ 중요: Edge Runtime은 Stripe 서명 검증이 불안정할 수 있음
export const runtime = 'nodejs'

// 환경 변수 검증
function validateEnvVars() {
  const required = {
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.error('❌ [WEBHOOK] Missing environment variables:', missing.join(', '))
    return { valid: false, missing }
  }

  return { valid: true, missing: [] }
}

export async function POST(req: NextRequest) {
  const requestId = `req_${Date.now()}`
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🔔 [WEBHOOK] Request received`, { requestId })
  
  // 환경 변수 검증
  const envCheck = validateEnvVars()
  if (!envCheck.valid) {
    console.error(`❌ [WEBHOOK] Env validation failed`, { requestId, missing: envCheck.missing })
    return NextResponse.json(
      { error: 'Server configuration error', missing: envCheck.missing },
      { status: 500 }
    )
  }
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error(`❌ [WEBHOOK] No signature`, { requestId })
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  // 1. 서명 검증 (보안)
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log(`✅ [WEBHOOK] Signature verified`, { 
      requestId, 
      eventType: event.type, 
      eventId: event.id 
    })
  } catch (err: any) {
    console.error(`❌ [WEBHOOK] Signature verification failed`, { 
      requestId, 
      error: err.message,
      signaturePresent: !!signature,
      bodyLength: body.length
    })
    return NextResponse.json(
      { error: 'Signature verification failed', details: err.message },
      { status: 400 }
    )
  }

  // 지원하는 이벤트 타입
  const SUPPORTED_EVENTS = ['checkout.session.completed', 'charge.refunded']

  // 이벤트 타입 로깅
  if (!SUPPORTED_EVENTS.includes(event.type)) {
    console.log(`⏭️ [WEBHOOK] Ignoring event`, {
      requestId,
      eventType: event.type,
      eventId: event.id
    })
    return NextResponse.json({ received: true, ignored: true })
  }

  const supabase = createAdminClient()

  // 멱등성 체크: 이미 처리한 이벤트인지 확인
  console.log(`🔍 [WEBHOOK] Checking idempotency`, { requestId, eventId: event.id })

  const { data: existingEvent } = await supabase
    .from('processed_stripe_events')
    .select('id')
    .eq('event_id', event.id)
    .single()

  if (existingEvent) {
    console.log(`⏭️ [WEBHOOK] Event already processed (idempotent)`, {
      requestId,
      eventId: event.id,
      existingEventId: existingEvent.id
    })
    return NextResponse.json({ received: true, alreadyProcessed: true })
  }

  // ========================================
  // charge.refunded 처리 (환불 동기화)
  // ========================================
  if (event.type === 'charge.refunded') {
    console.log(`💰 [WEBHOOK] Processing charge.refunded`, { requestId, eventId: event.id })

    const charge = event.data.object as Stripe.Charge

    try {
      // payment_intent로 주문 찾기
      const paymentIntentId = charge.payment_intent as string

      if (!paymentIntentId) {
        console.log(`⏭️ [WEBHOOK] No payment_intent in charge, skipping`)
        return NextResponse.json({ received: true, skipped: true })
      }

      // payment_intent로 checkout session 찾기
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      })

      if (sessions.data.length === 0) {
        console.log(`⏭️ [WEBHOOK] No session found for payment_intent: ${paymentIntentId}`)
        return NextResponse.json({ received: true, skipped: true })
      }

      const sessionId = sessions.data[0].id

      // 주문 찾기
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, payment_status, return_status')
        .eq('stripe_session_id', sessionId)
        .single()

      if (orderError || !order) {
        console.log(`⏭️ [WEBHOOK] Order not found for session: ${sessionId}`)
        return NextResponse.json({ received: true, skipped: true })
      }

      // 이미 환불 처리됨
      if (order.payment_status === 'refunded') {
        console.log(`⏭️ [WEBHOOK] Order already refunded: ${order.id}`)
      } else {
        // 주문 상태 업데이트
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'refunded',
            return_status: 'refunded',
            stripe_refund_id: charge.refunds?.data[0]?.id || null,
            refund_amount: charge.amount_refunded,
            refunded_at: new Date().toISOString(),
          })
          .eq('id', order.id)

        if (updateError) {
          console.error(`❌ [WEBHOOK] Failed to update order: ${updateError.message}`)
          throw new Error(updateError.message)
        }

        console.log(`✅ [WEBHOOK] Order refund synced: ${order.id}`)
      }

      // 처리 완료 기록
      await supabase.from('processed_stripe_events').insert({
        event_id: event.id,
        event_type: event.type,
        metadata: { order_id: order.id, charge_id: charge.id },
      })

      return NextResponse.json({ received: true, orderId: order.id })
    } catch (error: any) {
      console.error(`❌ [WEBHOOK] Refund processing failed:`, error.message)
      return NextResponse.json({ received: true, error: error.message })
    }
  }

  // ========================================
  // checkout.session.completed 처리 (주문 생성)
  // ========================================
  console.log(`📦 [WEBHOOK] Processing checkout.session.completed`, {
    requestId,
    eventId: event.id
  })

  const session = event.data.object as Stripe.Checkout.Session

  try {
      // 3. 카트 아이템 파싱
      const cartItems: Array<{
        variant_id: string
        quantity: number
        price: number
      }> = JSON.parse(session.metadata?.cart_items || '[]')
      const userId = session.metadata?.user_id || null

      console.log(`📋 [WEBHOOK] Cart items parsed`, { 
        requestId, 
        eventId: event.id,
        itemCount: cartItems.length,
        userId: userId || 'guest'
      })

      if (cartItems.length === 0) {
        console.error(`❌ [WEBHOOK] No items in session`, { 
          requestId, 
          eventId: event.id,
          sessionId: session.id
        })
        return NextResponse.json({ error: 'No items in session' }, { status: 400 })
      }

      // 4. 총액 계산
      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      console.log(`💰 [WEBHOOK] Order details`, {
        requestId,
        eventId: event.id,
        userId: userId || 'guest',
        itemCount: cartItems.length,
        total,
        sessionId: session.id,
      })

      // 5. 주문 생성 (멱등 업서트 - stripe_session_id 기준)
      console.log(`🔄 [WEBHOOK] Creating/updating order (upsert)`, { requestId, eventId: event.id })

      // metadata에서 배송 정보 추출 (커스텀 폼에서 입력받은 정보)
      const shippingAddress = session.metadata?.shipping_address ? {
        name: session.metadata.shipping_name || '',
        phone: session.metadata.shipping_phone || '',
        address: session.metadata.shipping_address,
        address_detail: session.metadata.shipping_address_detail || '',
        postal_code: session.metadata.shipping_postal_code || '',
        memo: session.metadata.shipping_memo || '',
      } : (session.shipping_details?.address ? {
        // fallback: Stripe 기본 배송 정보
        line1: session.shipping_details.address.line1,
        line2: session.shipping_details.address.line2,
        city: session.shipping_details.address.city,
        state: session.shipping_details.address.state,
        postal_code: session.shipping_details.address.postal_code,
        country: session.shipping_details.address.country,
      } : null)

      const customerName = session.metadata?.shipping_name || session.customer_details?.name || session.shipping_details?.name || null
      const customerEmail = session.customer_details?.email || null
      const customerPhone = session.metadata?.shipping_phone || null

      console.log(`📮 [WEBHOOK] Shipping/Customer info`, {
        requestId,
        eventId: event.id,
        hasShipping: !!shippingAddress,
        customerEmail: customerEmail || 'none',
        customerName: customerName || 'none',
      })

      // 먼저 기존 주문 확인 (stripe_session_id로)
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, payment_status')
        .eq('stripe_session_id', session.id)
        .single()

      let order: any

      if (existingOrder) {
        // 이미 주문 존재 - 업데이트만 (멱등성)
        console.log(`♻️ [WEBHOOK] Order already exists, updating`, {
          requestId,
          eventId: event.id,
          orderId: existingOrder.id
        })

        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            shipping_address: shippingAddress,
            customer_email: customerEmail,
            customer_name: customerName,
            customer_phone: customerPhone,
          })
          .eq('id', existingOrder.id)
          .select()
          .single()

        if (updateError) {
          throw new Error(`Failed to update order: ${updateError.message}`)
        }
        order = updatedOrder
      } else {
        // 주문번호 생성 (A7-YYMMDD-XXXX)
        const now = new Date()
        const yy = String(now.getFullYear()).slice(2)
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
        const orderNumber = `A7-${yy}${mm}${dd}-${rand}`

        // 새 주문 생성
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId === 'guest' ? null : userId,
            order_number: orderNumber,
            payment_status: 'paid',
            fulfillment_status: 'unfulfilled',
            total,
            stripe_session_id: session.id,
            shipping_address: shippingAddress,
            customer_email: customerEmail,
            customer_name: customerName,
            customer_phone: customerPhone,
          })
          .select()
          .single()

        if (orderError || !newOrder) {
          console.error(`❌ [WEBHOOK] Order creation failed`, {
            requestId,
            eventId: event.id,
            error: orderError?.message,
            code: orderError?.code
          })
          throw new Error(`Failed to create order: ${orderError?.message}`)
        }
        order = newOrder
      }

      console.log(`✅ [WEBHOOK] Order ready`, {
        requestId,
        eventId: event.id,
        orderId: order.id,
        wasExisting: !!existingOrder
      })

      // 6. 주문 아이템 생성 (멱등 - 이미 있으면 스킵)
      const { data: existingItems } = await supabase
        .from('order_items')
        .select('id')
        .eq('order_id', order.id)

      if (existingItems && existingItems.length > 0) {
        console.log(`♻️ [WEBHOOK] Order items already exist, skipping`, {
          requestId,
          eventId: event.id,
          orderId: order.id,
          existingCount: existingItems.length
        })
      } else {
        console.log(`🔄 [WEBHOOK] Creating order items`, {
          requestId,
          eventId: event.id,
          orderId: order.id,
          itemCount: cartItems.length
        })

        const orderItems = cartItems.map((item) => ({
          order_id: order.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error(`❌ [WEBHOOK] Order items creation failed`, {
            requestId,
            eventId: event.id,
            orderId: order.id,
            error: itemsError.message
          })
          throw new Error(`Failed to create order items: ${itemsError.message}`)
        }

        console.log(`✅ [WEBHOOK] Order items created`, {
          requestId,
          eventId: event.id,
          orderId: order.id
        })
      }

      // 7. 원자적 재고 차감 (동시성 안전)
      console.log(`📦 [WEBHOOK] Starting stock decrement`, { 
        requestId, 
        eventId: event.id,
        orderId: order.id,
        itemCount: cartItems.length
      })

      const stockResults = []
      let hasStockError = false

      for (const item of cartItems) {
        console.log(`🔄 [WEBHOOK] Decrementing stock`, { 
          requestId,
          eventId: event.id,
          variantId: item.variant_id,
          quantity: item.quantity
        })
        
        const { data, error } = await supabase
          .rpc('atomic_decrement_stock', {
            p_variant_id: item.variant_id,
            p_quantity: item.quantity,
          })

        if (error) {
          console.error(`❌ [WEBHOOK] Stock decrement RPC error`, { 
            requestId,
            eventId: event.id,
            variantId: item.variant_id,
            error: error.message
          })
          hasStockError = true
          stockResults.push({ variant_id: item.variant_id, success: false, error: error.message })
          continue
        }

        const result = data?.[0]

        if (!result?.success) {
          console.error(`❌ [WEBHOOK] Stock decrement failed`, { 
            requestId,
            eventId: event.id,
            variantId: item.variant_id,
            error: result?.error_message || 'Unknown error'
          })
          hasStockError = true
          stockResults.push({ 
            variant_id: item.variant_id, 
            success: false, 
            error: result?.error_message || 'Unknown error'
          })
        } else {
          console.log(`✅ [WEBHOOK] Stock decremented`, { 
            requestId,
            eventId: event.id,
            variantId: item.variant_id,
            newStock: result.new_stock
          })
          stockResults.push({ variant_id: item.variant_id, success: true, new_stock: result.new_stock })
        }
      }

      // 8. 재고 부족 시 주문 상태 업데이트
      if (hasStockError) {
        console.warn(`⚠️ [WEBHOOK] Stock issues detected, marking order as pending`, { 
          requestId,
          eventId: event.id,
          orderId: order.id,
          stockResults
        })
        
        await supabase
          .from('orders')
          .update({ 
            payment_status: 'pending',
            fulfillment_status: 'canceled'
          })
          .eq('id', order.id)

        // 관리자에게 알림 (추후 이메일/슬랙 연동)
        console.error(`🚨 [WEBHOOK] ORDER REQUIRES MANUAL REVIEW`, {
          requestId,
          eventId: event.id,
          orderId: order.id,
          stockResults,
        })
      }

      // 9. 주문 완료 이메일 발송
      if (customerEmail && !hasStockError) {
        try {
          const { data: emailItems } = await supabase
            .from('order_items')
            .select('quantity, price, variant:variants(color, size, product:products(name))')
            .eq('order_id', order.id)

          const emailData: EmailOrderData = {
            orderNumber: order.order_number || order.id.slice(0, 8),
            customerName: customerName || '고객',
            customerEmail,
            total: formatPrice(total),
            items: (emailItems || []).map((item: any) => {
              const v = Array.isArray(item.variant) ? item.variant[0] : item.variant
              const p = v && (Array.isArray(v.product) ? v.product[0] : v.product)
              return {
                name: p?.name || '상품',
                option: v ? `${v.color} / ${v.size}` : '-',
                quantity: item.quantity,
                price: formatPrice(item.price * item.quantity),
              }
            }),
          }

          await sendOrderConfirmation(emailData)
        } catch (emailErr: any) {
          console.error('⚠️ [WEBHOOK] Email send failed (non-blocking):', emailErr.message)
        }
      }

      // 10. 실패 큐에서 제거 (성공했으므로)
      await supabase
        .from('stripe_webhook_failures')
        .update({ status: 'succeeded', updated_at: new Date().toISOString() })
        .eq('event_id', event.id)

      // 11. 처리 완료 이벤트 기록 (멱등성 보장)
      console.log(`💾 [WEBHOOK] Recording processed event`, {
        requestId,
        eventId: event.id,
        orderId: order.id
      })

      await supabase
        .from('processed_stripe_events')
        .insert({
          event_id: event.id,
          event_type: event.type,
          metadata: {
            order_id: order.id,
            session_id: session.id,
            stock_results: stockResults,
            request_id: requestId,
          },
        })

      console.log(`✅ [WEBHOOK] Processing completed successfully`, { 
        requestId,
        eventId: event.id,
        orderId: order.id,
        hasStockIssues: hasStockError
      })
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      return NextResponse.json({ 
        received: true, 
        orderId: order.id,
        hasStockIssues: hasStockError,
        requestId
      })
    } catch (error: any) {
      console.error(`❌ [WEBHOOK] Processing failed`, {
        requestId,
        eventId: event.id,
        error: error.message,
        stack: error.stack
      })

      // 실패 큐에 저장 (자동 재처리 대기)
      try {
        const supabaseForQueue = createAdminClient()

        // 기존 실패 기록 확인 (attempts 유지)
        const { data: existingFailure } = await supabaseForQueue
          .from('stripe_webhook_failures')
          .select('attempts')
          .eq('event_id', event.id)
          .single()

        await saveToFailureQueue(
          supabaseForQueue,
          event.id,
          event.type,
          { session: event.data.object, metadata: (event.data.object as any).metadata },
          error.message,
          existingFailure?.attempts || 0
        )
      } catch (queueError: any) {
        console.error(`❌ [WEBHOOK] Failed to save to queue`, {
          requestId,
          eventId: event.id,
          queueError: queueError.message
        })
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Stripe에 200 반환 (재시도 방지 - 우리가 직접 재처리)
      return NextResponse.json({
        received: true,
        queued: true,
        error: error.message,
        requestId
      })
    }
}

