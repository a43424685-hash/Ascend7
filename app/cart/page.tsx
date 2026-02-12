'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/features/cart/cart-context'
import { getCartItemsClient } from '@/entities/cart/api/get-cart-items-client'
import type { CartItemWithVariant } from '@/shared/types/cart'
import { formatPrice } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, isLoaded } = useCart()
  const [cartItemsWithData, setCartItemsWithData] = useState<
    CartItemWithVariant[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    const fetchCartData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const items = await getCartItemsClient(cartItems)
        setCartItemsWithData(items)
      } catch (err: any) {
        console.error('장바구니 데이터 조회 실패:', err)
        setError(err.message || '장바구니를 불러올 수 없습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCartData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, JSON.stringify(cartItems)])

  const subtotal = cartItemsWithData.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  )
  const shippingFee = subtotal >= 50000 ? 0 : 3000

  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    const item = cartItemsWithData.find((i) => i.variant_id === variantId)
    if (item && newQuantity > item.variant.stock) {
      alert(`재고가 부족합니다. (최대 ${item.variant.stock}개)`)
      return
    }
    updateQuantity(variantId, newQuantity)
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-32 mx-auto" />
          <div className="h-24 bg-gray-100 rounded" />
          <div className="h-24 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">장바구니</h1>
        <div className="bg-red-50 border-2 border-red-200 p-6">
          <p className="text-red-800 font-semibold mb-2">오류 발생</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (cartItemsWithData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">장바구니</h1>
        <p className="text-gray-600 mb-8">장바구니가 비어있습니다.</p>
        <Link href="/shop">
          <Button>쇼핑하러 가기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">장바구니</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItemsWithData.map((item) => {
            const isOutOfStock = item.variant.stock === 0
            const exceedsStock = item.quantity > item.variant.stock

            return (
              <div
                key={item.variant_id}
                className="flex gap-4 border-b border-gray-200 pb-4"
              >
                {item.image_url && (
                  <div className="w-24 h-24 relative bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="font-semibold hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {item.variant.color} / {item.variant.size}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {formatPrice(item.variant.price)}
                  </p>
                  {isOutOfStock && (
                    <p className="text-xs text-red-600 mt-1">품절</p>
                  )}
                  {exceedsStock && !isOutOfStock && (
                    <p className="text-xs text-orange-600 mt-1">
                      재고 부족 (재고: {item.variant.stock}개)
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.variant_id,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 border border-black flex items-center justify-center text-sm hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.variant_id,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.variant.stock}
                        className="w-8 h-8 border border-black flex items-center justify-center text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.variant_id)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(item.variant.price * item.quantity)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="lg:col-span-1">
          <div className="border-2 border-black p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">주문 요약</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>상품 금액</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>배송비</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-medium">무료</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-gray-400">
                  {formatPrice(50000 - subtotal)} 더 구매 시 무료배송
                </p>
              )}
            </div>
            <div className="border-t border-black pt-4 mb-4">
              <div className="flex justify-between font-bold">
                <span>합계</span>
                <span>{formatPrice(subtotal + shippingFee)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                주문하기
              </Button>
            </Link>
            <Link href="/shop" className="block mt-4">
              <Button variant="outline" className="w-full">
                쇼핑 계속하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
