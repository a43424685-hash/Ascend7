'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { uploadCmsImage } from '@/entities/cms/api/upload-cms-image'

interface ImageUploaderProps {
  label: string
  value: string
  onChange: (url: string) => void
  prefix?: string
}

export function ImageUploader({ label, value, onChange, prefix = 'sections' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('prefix', prefix)
      const url = await uploadCmsImage(formData)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패')
    }
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium">{label}</label>

      {value && (
        <div className="relative w-full h-28 bg-gray-100 rounded overflow-hidden">
          <Image src={value} alt="" fill className="object-cover" sizes="400px" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full px-3 py-1.5 border border-dashed border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {uploading ? '업로드 중...' : value ? '이미지 변경' : '이미지 선택'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
          e.target.value = ''
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
