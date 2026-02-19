'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductWithDetails } from '@/shared/types/database'
import { formatPrice } from '@/shared/lib/utils'
import { useCart } from '@/features/cart/cart-context'
import { Button } from '@/shared/ui/button'
/* 신뢰/정책 요약 상수 - 문구 수정 가능 */
const PURCHASE_POLICIES = [
  { icon: '🚚', text: '50,000원 이상 무료배송' },
  { icon: '🔄', text: '수령 후 7일 이내 교환/반품' },
]

interface ProductDetailsProps {
  product: ProductWithDetails
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  const showNotification = (type: 'error' | 'success', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 2500)
  }

  const colors = Array.from(
    new Set(product.variants.map((v) => v.color))
  ).filter(Boolean)

  const sizes = Array.from(
    new Set(
      product.variants
        .filter((v) => !selectedColor || v.color === selectedColor)
        .map((v) => v.size)
    )
  ).filter(Boolean)

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  )

  const isAvailable = selectedVariant && selectedVariant.stock > 0
  const availableStock = selectedVariant?.stock || 0

  const prices = product.variants.map((v) => v.price)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

  const validateSelection = (): boolean => {
    if (!selectedColor) {
      showNotification('error', '색상을 선택해주세요.')
      return false
    }
    if (!selectedSize) {
      showNotification('error', '사이즈를 선택해주세요.')
      return false
    }
    if (!selectedVariant || !isAvailable) {
      showNotification('error', '재고가 없습니다.')
      return false
    }
    return true
  }

  const handleAddToCart = () => {
    if (!validateSelection()) return
    addItem(selectedVariant!.id, quantity)
    setSelectedColor('')
    setSelectedSize('')
    setQuantity(1)
    showNotification('success', '장바구니에 추가되었습니다.')
  }

  const handleBuyNow = () => {
    if (!validateSelection()) return
    addItem(selectedVariant!.id, quantity)
    router.push('/checkout')
  }

  const buttonLabel = !selectedColor
    ? '옵션을 선택해주세요'
    : !selectedSize
    ? '사이즈를 선택해주세요'
    : isAvailable
    ? '장바구니 담기'
    : '품절'

  return (
    <div>
      {/* 인라인 알림 토스트 */}
      {notification && (
        <div
          className={`fixed top-[72px] right-4 z-[9995] px-5 py-3 rounded shadow-lg text-sm font-medium animate-fade-in-up ${
            notification.type === 'success'
              ? 'bg-black text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Purchase Box - sticky on desktop */}
      <div className="lg:sticky lg:top-8">
        {/* Product Name */}
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">
          {product.name}
        </h1>

        {/* Price */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          {selectedVariant ? (
            <p className="text-2xl lg:text-3xl font-bold">
              {formatPrice(selectedVariant.price)}
            </p>
          ) : (
            <p className="text-2xl lg:text-3xl font-bold">
              {minPrice === maxPrice
                ? formatPrice(minPrice)
                : `${formatPrice(minPrice)} ~ ${formatPrice(maxPrice)}`}
            </p>
          )}
          {product.description && (
            <p className="text-sm text-gray-500 leading-relaxed mt-3">
              {product.description}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-6 mb-6">
          {/* Color */}
          {colors.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-3">
                색상
                {selectedColor && (
                  <span className="font-normal text-gray-400 ml-2">
                    {selectedColor}
                  </span>
                )}
              </label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color)
                      setSelectedSize('')
                      setQuantity(1)
                    }}
                    className={`px-5 py-2.5 text-sm font-medium border-2 transition-all ${
                      selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {selectedColor && sizes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-3">
                사이즈
                {selectedSize && (
                  <span className="font-normal text-gray-400 ml-2">
                    {selectedSize}
                  </span>
                )}
              </label>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const variant = product.variants.find(
                    (v) => v.size === size && v.color === selectedColor
                  )
                  const inStock = variant && variant.stock > 0

                  return (
                    <button
                      key={size}
                      onClick={() => inStock && setSelectedSize(size)}
                      disabled={!inStock}
                      className={`relative px-5 py-2.5 text-sm font-medium border-2 transition-all ${
                        !inStock
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                          : selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {size}
                      {!inStock && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] leading-none px-1 py-0.5 font-bold">
                          품절
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          {selectedVariant && (
            <div>
              <label className="block text-sm font-semibold mb-3">수량</label>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <span className="w-14 h-10 border-t border-b border-gray-300 flex items-center justify-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(availableStock, quantity + 1))
                  }
                  disabled={quantity >= availableStock}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
                {availableStock > 0 && availableStock <= 5 && (
                  <span className="ml-3 text-xs text-red-500 font-medium">
                    {availableStock}개 남음
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Total */}
        {selectedVariant && isAvailable && (
          <div className="flex justify-between items-center py-4 border-t border-gray-200 mb-4">
            <span className="text-sm font-semibold text-gray-600">
              총 상품 금액
            </span>
            <span className="text-xl font-bold">
              {formatPrice(selectedVariant.price * quantity)}
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3 mb-8">
          <Button
            onClick={handleAddToCart}
            disabled={!!(selectedColor && selectedSize && !isAvailable)}
            className="w-full"
            size="lg"
          >
            {buttonLabel}
          </Button>
          {isAvailable && (
            <Button
              onClick={handleBuyNow}
              variant="outline"
              className="w-full"
              size="lg"
            >
              바로 구매
            </Button>
          )}
        </div>

        {/* Trust / Policy Summary */}
        <div className="border-t border-gray-200 pt-6 space-y-3">
          {PURCHASE_POLICIES.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm text-gray-500"
            >
              <span>{p.icon}</span>
              <span>{p.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 lg:hidden z-50">
        <Button onClick={handleAddToCart} variant="outline" className="flex-1">
          장바구니
        </Button>
        <Button onClick={handleBuyNow} className="flex-1">
          바로 구매
        </Button>
      </div>
    </div>
  )
}
