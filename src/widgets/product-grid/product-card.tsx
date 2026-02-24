'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithImages } from '@/shared/types/database'
import { formatPrice } from '@/shared/lib/utils'

interface ProductCardProps {
  product: ProductWithImages
}

export function ProductCard({ product }: ProductCardProps) {
  const images = product.images.map((img) => img.url).filter(Boolean)
  const [currentIdx, setCurrentIdx] = useState(0)

  const isComingSoon = product.is_coming_soon === true
  const activeVariants = product.variants?.filter((v) => v.is_active) || []
  const variantPrices = activeVariants.map((v) => v.price)
  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0
  const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : 0
  const hasStock = activeVariants.some((v) => v.stock > 0)

  // 이미지 자동 슬라이드 (이미지 2개 이상일 때, 준비중이면 정지)
  useEffect(() => {
    if (images.length <= 1 || isComingSoon) return
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [images.length, isComingSoon])

  const imageArea = (
    <div className="aspect-[3/4] relative bg-gray-50 overflow-hidden">
      {/* 이미지 영역 (준비중이면 blur + opacity) */}
      <div className={isComingSoon ? 'absolute inset-0 blur-sm opacity-40' : 'absolute inset-0'}>
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
            {/* 이미지 인디케이터 (2개 이상, 준비중 아닐 때만) */}
            {images.length > 1 && !isComingSoon && (
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
      </div>

      {/* Coming Soon 오버레이 */}
      {isComingSoon && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="text-[11px] font-bold tracking-[0.3em] text-white uppercase">
            Coming Soon
          </span>
        </div>
      )}

      {/* Sold Out 오버레이 (준비중 아닐 때만) */}
      {!isComingSoon && !hasStock && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <span className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase">Sold Out</span>
        </div>
      )}
    </div>
  )

  const infoArea = (
    <div className="mt-3.5 sm:mt-4">
      <p className="text-[9px] tracking-[0.2em] text-gray-300 uppercase mb-1 font-medium">ASCEND7</p>
      <h3 className="text-xs sm:text-[13px] font-medium tracking-tight text-gray-900 line-clamp-1 leading-snug">
        {product.name}
      </h3>
      <p className="text-xs sm:text-[13px] text-gray-400 mt-1 tabular-nums">
        {isComingSoon ? (
          <span className="text-orange-400">준비중</span>
        ) : minPrice > 0 ? (
          minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} ~`
        ) : (
          '가격 문의'
        )}
      </p>
    </div>
  )

  // 준비중 상품은 클릭/호버 비활성화
  if (isComingSoon) {
    return (
      <div className="block cursor-default select-none">
        {imageArea}
        {infoArea}
      </div>
    )
  }

  return (
    <Link href={`/product/${product.slug}`} className="block" style={{ touchAction: 'manipulation' }}>
      {imageArea}
      {infoArea}
    </Link>
  )
}
