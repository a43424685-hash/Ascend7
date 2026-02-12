'use server'

import { stripe } from '@/shared/lib/stripe'
import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { CartItemWithVariant } from '@/shared/types/cart'
import type { ShippingInfo } from './get-default-shipping'

export async function createCheckoutSession(
  cartItems: CartItemWithVariant[],
  shippingInfo?: ShippingInfo
) {
  if (cartItems.length === 0) {
    throw new Error('Cart is empty')
  }

  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Build line items for Stripe
  const lineItems = cartItems
    .map((item) => {
      // 재고 확인
      if (item.variant.stock < item.quantity) {
        return null
      }
      return {
        price_data: {
          currency: 'krw',
          product_data: {
            name: `${item.product.name} - ${item.variant.color} / ${item.variant.size}`,
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: item.variant.price,
        },
        quantity: item.quantity,
      }
    })
    .filter(Boolean) as any[]

  if (lineItems.length === 0) {
    throw new Error('No valid items in cart')
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  )

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    metadata: {
      user_id: user?.id || 'guest',
      cart_items: JSON.stringify(
        cartItems.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.variant.price,
        }))
      ),
      // 배송 정보
      shipping_name: shippingInfo?.name || '',
      shipping_phone: shippingInfo?.phone || '',
      shipping_address: shippingInfo?.address || '',
      shipping_address_detail: shippingInfo?.addressDetail || '',
      shipping_postal_code: shippingInfo?.postalCode || '',
      shipping_memo: shippingInfo?.memo || '',
    },
  })

  return { sessionId: session.id, url: session.url }
}

