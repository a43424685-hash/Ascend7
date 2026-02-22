'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithImages } from '@/shared/types/database'
import { formatPrice } from '@/shared/lib/utils'
import { toggleWishlist } from '@/features/wishlist/actions/toggle-wishlist'

interface ProductCardProps {
  product: ProductWithImages
  initialWishlisted?: boolean
}

export function ProductCard({ product, initialWishlisted = false }: ProductCardProps) {
  const images = product.images.map((img) => img.url).filter(Boolean)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isPending, startTransition] = useTransition()

  const activeVariants = product.variants?.filter((v) => v.is_active) || []
  const variantPrices = activeVariants.map((v) => v.price)
  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0
  const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : 0
  const hasStock = activeVariants.some((v) => v.stock > 0)

  // 이미지 자동 슬라이드 (이미지 2개 이상일 때)
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [images.length])

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const result = await toggleWishlist(product.id)
      if (result.success) {
        setWishlisted(result.wishlisted)
      } else if (result.error === '로그인이 필요합니다.') {
        window.location.href = '/auth/login'
      }
    })
  }

  return (
    <div className="group">
      <Link href={`/product/${product.slug}`} className="block">
        {/* 이미지 */}
        <div className="aspect-[3/4] relative bg-gray-50 overflow-hidden">
          {images.length > 0 ? (
            <>
              {images.map((url, idx) => (
                <Image
                  key={url}
                  src={url}
                  alt={idx === 0 ? product.name : `${product.name} - ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-opacity duration-700 ease-in-out"
                  style={{ opacity: idx === currentIdx ? 1 : 0 }}
                  priority={idx === 0}
                />
              ))}
              {/* 이미지 인디케이터 (2개 이상일 때만) */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`block w-1 h-1 rounded-full transition-colors duration-300 ${
                        idx === currentIdx ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] tracking-[0.2em] text-gray-300 uppercase">No Image</span>
            </div>
          )}

          {!hasStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase">Sold Out</span>
            </div>
          )}

          {/* 찜 버튼 */}
          <button
            onClick={handleWishlistClick}
            disabled={isPending}
            className={`absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
              wishlisted
                ? 'bg-white shadow-sm opacity-100'
                : 'opacity-0 group-hover:opacity-100 bg-white/80'
            }`}
            aria-label={wishlisted ? '찜 취소' : '찜하기'}
          >
            <svg
              className={`w-4 h-4 transition-all duration-200 ${
                wishlisted
                  ? 'fill-red-500 stroke-red-500'
                  : 'fill-none stroke-gray-500'
              }`}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        {/* 상품 정보 */}
        <div className="mt-3.5 sm:mt-4">
          <p className="text-[9px] tracking-[0.2em] text-gray-300 uppercase mb-1 font-medium">ASCEND7</p>
          <h3 className="text-xs sm:text-[13px] font-medium tracking-tight text-gray-900 line-clamp-1 leading-snug">
            {product.name}
          </h3>
          <p className="text-xs sm:text-[13px] text-gray-400 mt-1 tabular-nums">
            {minPrice > 0 ? (
              minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} ~`
            ) : (
              '가격 문의'
            )}
          </p>
        </div>
      </Link>
    </div>
  )
}
