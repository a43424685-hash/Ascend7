'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/features/cart/cart-context'
import { getCartItemsServer } from '@/entities/cart/api/get-cart-items-server'
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
        const items = await getCartItemsServer(cartItems)
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
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          <div className="h-7 bg-gray-200 rounded w-24" />
          <div className="h-20 bg-gray-100 rounded" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 text-center">
        <h1 className="text-xl sm:text-3xl font-bold mb-4">장바구니</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-semibold mb-2">오류 발생</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (cartItemsWithData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
        <h1 className="text-xl sm:text-3xl font-bold mb-3">장바구니</h1>
        <p className="text-sm text-gray-500 mb-8">장바구니가 비어있습니다.</p>
        <Link href="/shop">
          <Button>쇼핑하러 가기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-12">
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8">장바구니</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-0 divide-y divide-gray-100">
          {cartItemsWithData.map((item) => {
            const isOutOfStock = item.variant.stock === 0
            const exceedsStock = item.quantity > item.variant.stock

            return (
              <div
                key={item.variant_id}
                className="flex gap-3 sm:gap-4 py-4 first:pt-0"
              >
                {item.image_url && (
                  <div className="w-20 h-24 sm:w-24 sm:h-28 relative bg-gray-100 flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="text-sm font-semibold hover:underline line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
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
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.variant_id,
                            item.quantity - 1
                          )
                        }
                        className="w-7 h-7 border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.variant_id,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.variant.stock}
                        className="w-7 h-7 border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.variant_id)}
                      className="text-xs text-gray-400 hover:text-black transition-colors"
                    >
                      삭제
                    </button>
                    <span className="ml-auto text-sm font-semibold">
                      {formatPrice(item.variant.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 sticky top-20">
            <h2 className="text-sm font-bold mb-4">주문 요약</h2>
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">상품 금액</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">배송비</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-medium">무료</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[11px] text-gray-400">
                  {formatPrice(50000 - subtotal)} 더 구매 시 무료배송
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 pt-4 mb-5">
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
            <Link
              href="/shop"
              className="block text-center mt-3 text-xs text-gray-500 hover:text-black transition-colors"
            >
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
