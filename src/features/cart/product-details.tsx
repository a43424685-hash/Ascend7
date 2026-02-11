'use client'

import { useState } from 'react'
import type { ProductWithDetails } from '@/shared/types/database'
import { formatPrice } from '@/shared/lib/utils'
import { useCart } from '@/features/cart/cart-context'
import { Button } from '@/shared/ui/button'

interface ProductDetailsProps {
  product: ProductWithDetails
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCart()
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

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

  const handleAddToCart = () => {
    if (!selectedVariant || !isAvailable) {
      if (!selectedColor) {
        alert('색상을 선택해주세요.')
        return
      }
      if (!selectedSize) {
        alert('사이즈를 선택해주세요.')
        return
      }
      if (!isAvailable) {
        alert('재고가 없습니다.')
        return
      }
      return
    }

    // localStorage에는 variant_id와 quantity만 저장
    addItem(selectedVariant.id, quantity)

    // Reset after adding
    setSelectedColor('')
    setSelectedSize('')
    setQuantity(1)
    alert('장바구니에 추가되었습니다.')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      {selectedVariant && (
        <p className="text-2xl font-semibold mb-6">
          {formatPrice(selectedVariant.price)}
        </p>
      )}
      {product.description && (
        <p className="text-gray-600 mb-8">{product.description}</p>
      )}

      <div className="space-y-6 mb-8">
        {colors.length > 0 && (
          <div>
            <label className="block text-sm font-semibold mb-2">COLOR</label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    setSelectedSize('')
                  }}
                  className={`px-4 py-2 border-2 text-sm font-medium transition-colors ${
                    selectedColor === color
                      ? 'border-black bg-black text-white'
                      : 'border-black bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div>
            <label className="block text-sm font-semibold mb-2">SIZE</label>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((size) => {
                const variant = product.variants.find(
                  (v) => v.size === size && v.color === selectedColor
                )
                const inStock = variant && variant.stock > 0

                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!inStock}
                    className={`px-4 py-2 border-2 text-sm font-medium transition-colors ${
                      !inStock
                        ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                        : selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-black bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {selectedVariant && (
          <div>
            <label className="block text-sm font-semibold mb-2">QUANTITY</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border-2 border-black flex items-center justify-center font-semibold"
              >
                -
              </button>
              <span className="text-lg font-semibold w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(availableStock, quantity + 1))
                }
                disabled={quantity >= availableStock}
                className="w-10 h-10 border-2 border-black flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
              {availableStock > 0 && (
                <span className="text-sm text-gray-600">
                  재고: {availableStock}개
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={!isAvailable}
        className="w-full"
        size="lg"
      >
        {isAvailable ? 'ADD TO CART' : 'OUT OF STOCK'}
      </Button>
    </div>
  )
}

