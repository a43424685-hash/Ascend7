'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductWithDetails } from '@/shared/types/database'
import { formatPrice } from '@/shared/lib/utils'
import { useCart } from '@/features/cart/cart-context'
import { Button } from '@/shared/ui/button'
import { RestockAlertForm } from '@/features/restock/restock-alert-form'

const PURCHASE_POLICIES = [
  { icon: '🚚', text: '50,000원 이상 무료배송' },
  { icon: '🔄', text: '수령 후 7일 이내 교환/반품' },
]

type SelectedItem = {
  variantId: string
  color: string
  size: string
  price: number
  quantity: number
  maxStock: number
}

interface ProductDetailsProps {
  product: ProductWithDetails
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter()
  const { addItem } = useCart()

  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [restockVariant, setRestockVariant] = useState<{
    id: string
    color: string
    size: string
  } | null>(null)
  const [notification, setNotification] = useState<{
    type: 'error' | 'success'
    message: string
  } | null>(null)

  const showNotification = (type: 'error' | 'success', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 2500)
  }

  const colors = Array.from(new Set(product.variants.map((v) => v.color))).filter(Boolean)

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

  const selectedItemsTotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleAddToSelection = () => {
    if (!selectedColor) {
      showNotification('error', '색상을 선택해주세요.')
      return
    }
    if (!selectedSize) {
      showNotification('error', '사이즈를 선택해주세요.')
      return
    }
    if (!selectedVariant || !isAvailable) {
      showNotification('error', '재고가 없습니다.')
      return
    }

    const existing = selectedItems.find((i) => i.variantId === selectedVariant.id)
    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, existing.maxStock)
      setSelectedItems((prev) =>
        prev.map((i) =>
          i.variantId === selectedVariant.id ? { ...i, quantity: newQty } : i
        )
      )
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          variantId: selectedVariant.id,
          color: selectedColor,
          size: selectedSize,
          price: selectedVariant.price,
          quantity,
          maxStock: selectedVariant.stock,
        },
      ])
    }

    // 색상 유지, 사이즈·수량 초기화 (같은 색상 다른 사이즈 빠르게 추가 가능)
    setSelectedSize('')
    setQuantity(1)
    showNotification('success', '추가되었습니다.')
  }

  const updateItemQuantity = (variantId: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) }
          : i
      )
    )
  }

  const removeItem = (variantId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.variantId !== variantId))
  }

  const handleAddToCart = () => {
    if (selectedItems.length === 0) {
      showNotification('error', '옵션을 추가해주세요.')
      return
    }
    selectedItems.forEach((item) => addItem(item.variantId, item.quantity))
    setSelectedItems([])
    showNotification('success', '장바구니에 추가되었습니다.')
  }

  const handleBuyNow = () => {
    if (selectedItems.length === 0) {
      showNotification('error', '옵션을 추가해주세요.')
      return
    }
    selectedItems.forEach((item) => addItem(item.variantId, item.quantity))
    router.push('/checkout')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      showNotification('success', '링크가 복사되었습니다.')
    }
  }

  const hasOutOfStockSizes =
    selectedColor &&
    sizes.some((s) => {
      const v = product.variants.find((v) => v.size === s && v.color === selectedColor)
      return v && v.stock === 0
    })

  return (
    <div>
      {/* 토스트 알림 */}
      {notification && (
        <div
          className={`fixed top-[72px] right-4 z-[9995] px-5 py-3 rounded shadow-lg text-sm font-medium animate-fade-in-up ${
            notification.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="lg:sticky lg:top-8">
        {/* 상품명 */}
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">{product.name}</h1>

        {/* 가격 */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          {selectedVariant ? (
            <p className="text-2xl lg:text-3xl font-bold">{formatPrice(selectedVariant.price)}</p>
          ) : (
            <p className="text-2xl lg:text-3xl font-bold">
              {minPrice === maxPrice
                ? formatPrice(minPrice)
                : `${formatPrice(minPrice)} ~ ${formatPrice(maxPrice)}`}
            </p>
          )}
          {product.description && (
            <p className="text-sm text-gray-500 leading-relaxed mt-3">{product.description}</p>
          )}
        </div>

        {/* 옵션 선택 */}
        <div className="space-y-6 mb-4">
          {/* 색상 */}
          {colors.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-3">
                색상
                {selectedColor && (
                  <span className="font-normal text-gray-400 ml-2">{selectedColor}</span>
                )}
              </label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color)
                      setSelectedSize('')
                      setRestockVariant(null)
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

          {/* 사이즈 */}
          {selectedColor && sizes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-3">
                사이즈
                {selectedSize && (
                  <span className="font-normal text-gray-400 ml-2">{selectedSize}</span>
                )}
              </label>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const variant = product.variants.find(
                    (v) => v.size === size && v.color === selectedColor
                  )
                  const inStock = variant && variant.stock > 0
                  const isRestockTarget = restockVariant?.id === variant?.id

                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (inStock) {
                          setSelectedSize(size)
                          setRestockVariant(null)
                        } else if (variant) {
                          setSelectedSize('')
                          setRestockVariant(
                            isRestockTarget
                              ? null
                              : { id: variant.id, color: selectedColor, size }
                          )
                        }
                      }}
                      className={`relative px-5 py-2.5 text-sm font-medium border-2 transition-all ${
                        !inStock
                          ? isRestockTarget
                            ? 'border-gray-500 bg-gray-100 text-gray-600'
                            : 'border-gray-200 text-gray-300 bg-gray-50 hover:border-gray-400 hover:text-gray-500'
                          : selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {size}
                      {!inStock && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-400 text-white text-[9px] leading-none px-1 py-0.5 font-bold">
                          품절
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {hasOutOfStockSizes && !restockVariant && (
                <p className="text-xs text-gray-400 mt-2">
                  품절 사이즈를 클릭하면 재입고 알림을 신청할 수 있습니다.
                </p>
              )}
            </div>
          )}

          {/* 재입고 알림 폼 */}
          {restockVariant && (
            <RestockAlertForm
              variantId={restockVariant.id}
              variantLabel={`${restockVariant.color} / ${restockVariant.size}`}
            />
          )}

          {/* 수량 */}
          {selectedVariant && isAvailable && (
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
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
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

        {/* 추가 버튼 */}
        <button
          onClick={handleAddToSelection}
          disabled={!selectedVariant || !isAvailable}
          className={`w-full py-3 border-2 text-sm font-semibold transition-all mb-4 ${
            selectedVariant && isAvailable
              ? 'border-black text-black hover:bg-black hover:text-white'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >
          {!selectedColor
            ? '색상을 선택해주세요'
            : !selectedSize
            ? '사이즈를 선택해주세요'
            : isAvailable
            ? '+ 추가'
            : '품절'}
        </button>

        {/* 선택 목록 */}
        {selectedItems.length > 0 && (
          <div className="border border-gray-200 mb-4">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">선택 목록</span>
              <span className="text-xs text-gray-400">{selectedItems.length}개 옵션</span>
            </div>
            <div className="divide-y divide-gray-100">
              {selectedItems.map((item) => (
                <div key={item.variantId} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate">
                      {item.color} / {item.size}
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateItemQuantity(item.variantId, item.quantity - 1)}
                      className="w-7 h-7 border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-7 h-7 border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-gray-300 hover:text-gray-600 transition-colors shrink-0 text-base w-6 text-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 총 금액 + 구매 버튼 */}
        {selectedItems.length > 0 && (
          <>
            <div className="flex justify-between items-center py-3 border-t border-gray-200 mb-4">
              <span className="text-sm font-semibold text-gray-600">총 상품 금액</span>
              <span className="text-xl font-bold">{formatPrice(selectedItemsTotal)}</span>
            </div>
            <div className="space-y-3 mb-8">
              <Button onClick={handleAddToCart} className="w-full" size="lg">
                장바구니 담기
                {selectedItems.length > 1 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({selectedItems.length}개 옵션)
                  </span>
                )}
              </Button>
              <Button onClick={handleBuyNow} variant="outline" className="w-full" size="lg">
                바로 구매
              </Button>
            </div>
          </>
        )}

        {/* 정책 + 공유 */}
        <div className="border-t border-gray-200 pt-6 space-y-3 mt-4">
          {PURCHASE_POLICIES.map((p, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
              <span>{p.icon}</span>
              <span>{p.text}</span>
            </div>
          ))}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors mt-4 pt-4 border-t border-gray-100 w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            이 상품 공유하기
          </button>
        </div>
      </div>

      {/* 모바일 하단 고정 CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 lg:hidden z-50">
        <Button onClick={handleAddToCart} variant="outline" className="flex-1">
          장바구니{selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}
        </Button>
        <Button onClick={handleBuyNow} className="flex-1">
          바로 구매
        </Button>
      </div>
    </div>
  )
}
