'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct } from '@/entities/product/api/update-product'
import { Button } from '@/shared/ui/button'

interface DetailContentEditorProps {
  productId: string
  initialContent: string | null
}

export function DetailContentEditor({ productId, initialContent }: DetailContentEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent || '')
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
          상세 콘텐츠가 저장되었습니다.
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setPreviewMode(false)}
          className={`px-3 py-1 text-sm font-medium ${
            !previewMode
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          편집
        </button>
        <button
          onClick={() => setPreviewMode(true)}
          className={`px-3 py-1 text-sm font-medium ${
            previewMode
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          미리보기
        </button>
      </div>

      {previewMode ? (
        <div className="min-h-[300px] border border-gray-200 p-4">
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none font-mono text-sm"
            placeholder="HTML 코드를 입력하세요. 예:&#10;<div style='text-align:center'>&#10;  <img src='이미지URL' style='max-width:100%' />&#10;  <h2>상품 상세 정보</h2>&#10;  <p>상품에 대한 자세한 설명을 작성하세요.</p>&#10;</div>"
          />
          <p className="text-xs text-gray-500 mt-1">
            HTML 태그를 사용할 수 있습니다. 이미지는 &lt;img src=&quot;URL&quot;&gt; 태그로 삽입하세요.
          </p>
        </div>
      )}

      <Button onClick={handleSave} disabled={loading} size="sm">
        {loading ? '저장 중...' : '상세 콘텐츠 저장'}
      </Button>
    </div>
  )
}
