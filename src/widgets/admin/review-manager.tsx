'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleReviewActive, deleteReview } from '@/features/admin/actions/review-management'

interface ReviewItem {
  id: string
  rating: number
  title: string | null
  content: string
  is_active: boolean
  created_at: string
  author: { display_name: string | null } | null
  product: { name: string; slug: string } | null
}

interface ReviewManagerProps {
  items: ReviewItem[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function formatDate(str: string) {
  const d = new Date(str)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function ReviewManager({ items }: ReviewManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      if (!result.success) setError(result.error || '오류가 발생했습니다.')
      else router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">닫기</button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-400 text-sm">등록된 리뷰가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className={`px-4 py-3 ${!item.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StarRating rating={item.rating} />
                    {item.product && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{item.product.name}</span>
                    )}
                    {!item.is_active && (
                      <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded">숨김</span>
                    )}
                  </div>
                  {item.title && (
                    <p className="text-sm font-medium text-gray-800 mb-0.5">{item.title}</p>
                  )}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.content}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {item.author?.display_name || '회원'} · {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => run(() => toggleReviewActive(item.id, !item.is_active))}
                    disabled={loading}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    {item.is_active ? '숨기기' : '공개'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('이 리뷰를 삭제하시겠습니까?')) {
                        run(() => deleteReview(item.id))
                      }
                    }}
                    disabled={loading}
                    className="text-xs text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
