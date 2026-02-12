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

    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다')
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

      e.target.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return

    setDeleting(imageId)
    setError(null)

    try {
      await deleteProductImage(imageId, productId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 삭제에 실패했습니다')
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
            {uploading ? '업로드 중...' : '+ 이미지 업로드'}
          </Button>
        </label>
        <p className="text-xs text-gray-600 mt-1">
          최대 5MB. 형식: JPG, PNG, WebP
        </p>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square border border-gray-200 group"
            >
              <Image
                src={image.url}
                alt={`상품 이미지 ${index + 1}`}
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
                {deleting === image.id ? '삭제 중...' : '삭제'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-2">업로드된 이미지가 없습니다</p>
          <p className="text-sm text-gray-500">
            상품 페이지에 표시할 이미지를 업로드하세요
          </p>
        </div>
      )}
    </div>
  )
}
