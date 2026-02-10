'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/shared/ui/button'
import type { ProductImage } from '@/shared/types/database'
import { uploadProductImage, deleteProductImage } from '@/entities/product/api/manage-images'

interface ImagesManagerProps {
  productId: string
  images: ProductImage[]
}

export function ImagesManager({ productId, images }: ImagesManagerProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 확인 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      setError('File must be an image')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', productId)
      formData.append('sortOrder', String(images.length))

      await uploadProductImage(formData)
      router.refresh()
      
      // Reset file input
      e.target.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return

    setDeleting(imageId)
    setError(null)

    try {
      await deleteProductImage(imageId, productId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Upload Button */}
      <div>
        <label className="inline-block">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={(e) => {
              e.preventDefault()
              ;(e.currentTarget.previousElementSibling as HTMLInputElement)?.click()
            }}
          >
            {uploading ? 'Uploading...' : '+ Upload Image'}
          </Button>
        </label>
        <p className="text-xs text-gray-600 mt-1">
          Max size: 5MB. Formats: JPG, PNG, WebP
        </p>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square border border-gray-200 group"
            >
              <Image
                src={image.url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1">
                #{index + 1}
              </div>
              <button
                onClick={() => handleDelete(image.id)}
                disabled={deleting === image.id}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {deleting === image.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-2">No images uploaded yet</p>
          <p className="text-sm text-gray-500">
            Upload images to display on the product page
          </p>
        </div>
      )}
    </div>
  )
}

