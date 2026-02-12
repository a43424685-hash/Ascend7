import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'

/**
 * 게스트 주문 조회 API
 * order_number + phone으로 인증
 * 최소한의 정보만 반환 (주소 마스킹)
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { orderNumber, phone } = body

  if (!orderNumber || !phone) {
    return NextResponse.json(
      { error: '주문번호와 연락처를 모두 입력해주세요' },
      { status: 400 }
    )
  }

  // 전화번호에서 숫자만 추출 (비교용)
  const phoneDigits = phone.replace(/\D/g, '')

  if (phoneDigits.length < 10) {
    return NextResponse.json(
      { error: '올바른 전화번호를 입력해주세요' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // order_number로 주문 조회
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      payment_status,
      fulfillment_status,
      total,
      tracking_number,
      carrier,
      shipping_address,
      customer_name,
      customer_phone,
      created_at,
      return_status,
      order_items (
        id,
        quantity,
        price,
        variant:variants (
          color,
          size,
          product:products (
            name
          )
        )
      )
    `)
    .eq('order_number', orderNumber.trim().toUpperCase())
    .single()

  if (error || !order) {
    return NextResponse.json(
      { error: '주문을 찾을 수 없습니다. 주문번호를 확인해주세요.' },
      { status: 404 }
    )
  }

  // 전화번호 검증: customer_phone 또는 shipping_address.phone과 비교
  const orderPhoneDigits = (order.customer_phone || '').replace(/\D/g, '')
  const shippingPhoneDigits = ((order.shipping_address as any)?.phone || '').replace(/\D/g, '')

  if (phoneDigits !== orderPhoneDigits && phoneDigits !== shippingPhoneDigits) {
    return NextResponse.json(
      { error: '주문번호 또는 연락처가 일치하지 않습니다.' },
      { status: 404 }
    )
  }

  // 주소 마스킹
  const shippingAddress = order.shipping_address as Record<string, any> | null
  let maskedAddress = ''
  if (shippingAddress?.address) {
    const addr = shippingAddress.address as string
    // 앞 절반만 보여주고 나머지 마스킹
    const showLen = Math.min(Math.ceil(addr.length / 2), 15)
    maskedAddress = addr.slice(0, showLen) + '***'
  }

  // 주문 아이템 정규화
  const items = (order.order_items || []).map((oi: any) => {
    const variant = Array.isArray(oi.variant) ? oi.variant[0] : oi.variant
    const product = variant && (Array.isArray(variant.product) ? variant.product[0] : variant.product)

    return {
      quantity: oi.quantity,
      price: oi.price,
      product_name: product?.name || '상품',
      color: variant?.color || '',
      size: variant?.size || '',
    }
  })

  return NextResponse.json({
    order_number: order.order_number,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    total: order.total,
    tracking_number: order.tracking_number,
    carrier: order.carrier,
    customer_name: order.customer_name,
    masked_address: maskedAddress,
    return_status: order.return_status,
    created_at: order.created_at,
    items,
  })
}
