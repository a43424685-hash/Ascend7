'use server'

/**
 * TossPayments 결제 시작 전 pending 주문 생성
 *
 * 흐름:
 * 1. 체크아웃 페이지에서 이 함수 호출 → orderId 반환
 * 2. 반환된 orderId를 TossPayments widgets.requestPayment()에 전달
 * 3. 결제 성공 시 /payment/success?paymentKey=...&orderId=...&amount=...
 * 4. confirm API에서 실제 결제 승인 + 재고 차감
 */

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { CartItemWithVariant } from '@/shared/types/cart'
import type { ShippingInfo } from './get-default-shipping'

export async function createPendingOrder(
  cartItems: CartItemWithVariant[],
  shippingInfo: ShippingInfo,
  coupon?: { couponId: string; couponCode: string; discountAmount: number } | null
): Promise<{ orderId: string; orderNumber: string; total: number }> {
  if (cartItems.length === 0) {
    throw new Error('장바구니가 비어있습니다.')
  }

  // 사용자 정보 (게스트 허용)
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 금액 계산 (체크아웃 페이지와 동일한 로직)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  )
  const shippingFee = subtotal >= 50000 ? 0 : 3000
  const discountAmount = coupon?.discountAmount ?? 0
  const total = subtotal + shippingFee - discountAmount

  // 재고 검증
  for (const item of cartItems) {
    if (item.variant.stock < item.quantity) {
      throw new Error(`'${item.product.name}' 재고가 부족합니다.`)
    }
  }

  // 주문번호 생성 (A7-YYMMDD-XXXX)
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  const orderNumber = `A7-${yy}${mm}${dd}-${rand}`

  const shippingAddress = {
    name: shippingInfo.name,
    phone: shippingInfo.phone,
    address: shippingInfo.address,
    address_detail: shippingInfo.addressDetail,
    postal_code: shippingInfo.postalCode,
    memo: shippingInfo.memo,
  }

  const adminSupabase = createAdminClient()

  // pending 주문 생성 (결제 전 임시 상태)
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      user_id: user?.id || null,
      order_number: orderNumber,
      payment_status: 'pending',
      fulfillment_status: 'unfulfilled',
      total,
      payment_method: 'tosspayments',
      customer_name: shippingInfo.name,
      customer_phone: shippingInfo.phone,
      customer_email: user?.email || null,
      shipping_address: shippingAddress,
      coupon_id: coupon?.couponId || null,
      coupon_code: coupon?.couponCode || null,
      discount_amount: discountAmount || null,
    })
    .select('id, order_number')
    .single()

  if (orderError || !order) {
    throw new Error(`주문 생성 실패: ${orderError?.message}`)
  }

  // 주문 상품 생성
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price: item.variant.price,
  }))

  const { error: itemsError } = await adminSupabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    // 롤백: 주문 삭제
    await adminSupabase.from('orders').delete().eq('id', order.id)
    throw new Error(`주문 상품 등록 실패: ${itemsError.message}`)
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    total,
  }
}
