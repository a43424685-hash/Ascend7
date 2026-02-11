'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/features/cart/cart-context'
import { getCartItemsClient } from '@/entities/cart/api/get-cart-items-client'
import { createCheckoutSession } from '@/features/checkout/actions/create-checkout-session'
import type { CartItemWithVariant } from '@/shared/types/cart'
import { formatPrice } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, isLoaded } = useCart()
  const [cartItemsWithData, setCartItemsWithData] = useState<
    CartItemWithVariant[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (cartItems.length === 0) {
      router.push('/cart')
      return
    }

    const fetchCartData = async () => {
      setIsLoading(true)
      try {
        const items = await getCartItemsClient(cartItems)
        setCartItemsWithData(items)

        if (items.length === 0) {
          router.push('/cart')
        }
      } catch (err: any) {
        setError(err.message || '장바구니를 불러올 수 없습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCartData()
  }, [cartItems, isLoaded, router])

  const handleCheckout = async () => {
    if (cartItemsWithData.length === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      const { url } = await createCheckoutSession(cartItemsWithData)
      if (url) {
        window.location.href = url
      } else {
        setError('Checkout session creation failed')
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">CHECKOUT</h1>
        <div className="bg-red-50 border-2 border-red-200 p-6">
          <p className="text-red-800 font-semibold mb-2">오류 발생</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
        <Button
          onClick={() => router.push('/cart')}
          variant="outline"
          className="mt-4"
        >
          장바구니로 돌아가기
        </Button>
      </div>
    )
  }

  if (cartItemsWithData.length === 0) {
    return null
  }

  const subtotal = cartItemsWithData.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  )

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">CHECKOUT</h1>
      <div className="border-2 border-black p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">ORDER SUMMARY</h2>
        <div className="space-y-2 mb-4">
          {cartItemsWithData.map((item) => (
            <div key={item.variant_id} className="flex justify-between text-sm">
              <span>
                {item.product.name} ({item.variant.color} / {item.variant.size})
                x {item.quantity}
              </span>
              <span>{formatPrice(item.variant.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-black pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <Button
        onClick={handleCheckout}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
      </Button>
    </div>
  )
}
