import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/shared/lib/stripe'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import Stripe from 'stripe'

/**
 * Stripe 웹훅 핸들러 (프로덕션 안정화 버전)
 * 
 * 핵심 안전장치:
 * 1. 멱등성: 동일 이벤트 중복 처리 방지
 * 2. 원자적 재고 차감: Race condition 방지
 * 3. 에러 처리: 재고 부족 시 주문 상태 업데이트
 */

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

  // 이벤트 타입 로깅
  if (event.type !== 'checkout.session.completed') {
    console.log(`⏭️ [WEBHOOK] Ignoring event`, { 
      requestId, 
      eventType: event.type, 
      eventId: event.id 
    })
    return NextResponse.json({ received: true, ignored: true })
  }

  // checkout.session.completed 처리
  console.log(`📦 [WEBHOOK] Processing checkout.session.completed`, { 
    requestId, 
    eventId: event.id 
  })

  const session = event.data.object as Stripe.Checkout.Session

  try {
    const supabase = createAdminClient()

    // 2. 멱등성 체크: 이미 처리한 이벤트인지 확인
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

    console.log(`✅ [WEBHOOK] Idempotency check passed`, { requestId, eventId: event.id })

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

      // 5. 주문 생성 (+ 배송/고객 정보)
      console.log(`🔄 [WEBHOOK] Creating order`, { requestId, eventId: event.id })
      
      // Stripe에서 배송/고객 정보 추출
      const shippingAddress = session.shipping_details?.address ? {
        line1: session.shipping_details.address.line1,
        line2: session.shipping_details.address.line2,
        city: session.shipping_details.address.city,
        state: session.shipping_details.address.state,
        postal_code: session.shipping_details.address.postal_code,
        country: session.shipping_details.address.country,
      } : null
      
      const customerName = session.customer_details?.name || session.shipping_details?.name || null
      const customerEmail = session.customer_details?.email || null
      
      console.log(`📮 [WEBHOOK] Shipping/Customer info`, {
        requestId,
        eventId: event.id,
        hasShipping: !!shippingAddress,
        customerEmail: customerEmail || 'none',
        customerName: customerName || 'none',
      })
      
      const { data: order, error: orderError } = await supabase
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
        .select()
        .single()

      if (orderError || !order) {
        console.error(`❌ [WEBHOOK] Order creation failed`, { 
          requestId, 
          eventId: event.id,
          error: orderError?.message,
          code: orderError?.code
        })
        throw new Error(`Failed to create order: ${orderError?.message}`)
      }

      console.log(`✅ [WEBHOOK] Order created`, { 
        requestId, 
        eventId: event.id,
        orderId: order.id 
      })

      // 6. 주문 아이템 생성
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

      // 9. 처리 완료 이벤트 기록 (멱등성 보장)
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
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      return NextResponse.json(
        { 
          error: 'Webhook processing failed', 
          message: error.message,
          requestId
        },
        { status: 500 }
      )
    }
}

