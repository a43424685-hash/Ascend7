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

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No Image</span>
      </div>
    )
  }

  const selectedImage = images[selectedIndex]

  return (
    <div>
      <div className="aspect-square relative bg-gray-100 mb-4">
        <Image
          src={selectedImage.url}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square relative bg-gray-100 overflow-hidden border-2 transition-colors ${
                selectedIndex === index
                  ? 'border-black'
                  : 'border-transparent'
              }`}
            >
              <Image
                src={image.url}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

