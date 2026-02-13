'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct } from '@/entities/product/api/update-product'
import { uploadDetailImage } from '@/entities/product/api/upload-detail-image'
import { Button } from '@/shared/ui/button'

interface DetailContentEditorProps {
  productId: string
  initialContent: string | null
}

export function DetailContentEditor({ productId, initialContent }: DetailContentEditorProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState(initialContent || '')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProduct({
        id: productId,
        detail_content: content,
      })
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', productId)

      const imageUrl = await uploadDetailImage(formData)
      const imgTag = `<img src="${imageUrl}" alt="" style="max-width:100%; height:auto;" />`

      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newContent = content.slice(0, start) + imgTag + content.slice(end)
        setContent(newContent)
      } else {
        setContent((prev) => prev + '\n' + imgTag)
      }

      e.target.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
          상세 콘텐츠가 저장되었습니다.
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 flex-wrap">
        <button
          onClick={() => setPreviewMode(false)}
          className={`px-3 py-1 text-sm font-medium rounded ${
            !previewMode
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          편집
        </button>
        <button
          onClick={() => setPreviewMode(true)}
          className={`px-3 py-1 text-sm font-medium rounded ${
            previewMode
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          미리보기
        </button>

        {!previewMode && (
          <>
            <div className="w-px h-5 bg-gray-300 mx-1 hidden sm:block" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              {uploading ? '업로드 중...' : '이미지 삽입'}
            </button>
          </>
        )}
      </div>

      {previewMode ? (
        <div className="min-h-[300px] border border-gray-200 rounded p-4">
          {content ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-gray-400 text-sm">콘텐츠가 없습니다.</p>
          )}
        </div>
      ) : (
        <div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black outline-none font-mono text-xs sm:text-sm"
            placeholder="HTML 코드를 입력하거나, 위의 '이미지 삽입' 버튼으로 이미지를 업로드하세요."
          />
          <p className="text-xs text-gray-500 mt-1">
            HTML 태그를 사용하거나, 위의 이미지 삽입 버튼으로 이미지를 업로드할 수 있습니다.
          </p>
        </div>
      )}

      <Button onClick={handleSave} disabled={loading || uploading} size="sm">
        {loading ? '저장 중...' : '상세 콘텐츠 저장'}
      </Button>
    </div>
  )
}
