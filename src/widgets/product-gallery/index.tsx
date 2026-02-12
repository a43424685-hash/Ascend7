'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/shared/types/database'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">이미지 없음</span>
      </div>
    )
  }

  return (
    <div>
      {/* Main Image */}
      <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden mb-3">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
        )}
        <Image
          src={images[selectedIndex].url}
          alt={productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => {
                if (i !== selectedIndex) {
                  setIsLoading(true)
                  setSelectedIndex(i)
                }
              }}
              className={`flex-shrink-0 w-[72px] h-[90px] lg:w-20 lg:h-[100px] relative bg-gray-100 overflow-hidden border-2 transition-colors ${
                selectedIndex === i
                  ? 'border-black'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={img.url}
                alt={`${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
