'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleReviewActive, deleteReview, createReviewByAdmin } from '@/features/admin/actions/review-management'

interface ReviewItem {
  id: string
  rating: number
  title: string | null
  content: string
  is_active: boolean
  created_at: string
  admin_author_name: string | null
  author: { display_name: string | null } | null
  product: { name: string; slug: string } | null
}

interface Product {
  id: string
  name: string
}

interface ReviewManagerProps {
  items: ReviewItem[]
  products: Product[]
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

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <svg className={`w-6 h-6 transition-colors ${s <= (hover || value) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {value > 0 && <span className="ml-1 text-sm text-gray-500 self-center">{value}점</span>}
    </div>
  )
}

function formatDate(str: string) {
  const d = new Date(str)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const BODY_TYPES = ['마른 편', '보통', '통통한 편', '근육질', '기타']

export function ReviewManager({ items, products }: ReviewManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const [form, setForm] = useState({
    admin_author_name: '',
    product_id: '',
    rating: 0,
    title: '',
    content: '',
    height: '',
    weight: '',
    body_type: '',
  })

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await run(() => createReviewByAdmin({
      admin_author_name: form.admin_author_name,
      product_id: form.product_id,
      rating: form.rating,
      title: form.title || undefined,
      content: form.content,
      height: form.height ? parseInt(form.height) : null,
      weight: form.weight ? parseInt(form.weight) : null,
      body_type: form.body_type || null,
    }))
    if (!error) {
      setIsAdding(false)
      setForm({ admin_author_name: '', product_id: '', rating: 0, title: '', content: '', height: '', weight: '', body_type: '' })
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">닫기</button>
        </div>
      )}

      {/* 리뷰 직접 작성 폼 */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="font-semibold text-sm">리뷰 직접 작성</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">표시 아이디명 *</label>
              <input
                type="text"
                value={form.admin_author_name}
                onChange={(e) => setForm(p => ({ ...p, admin_author_name: e.target.value }))}
                required
                placeholder="예: 홍길**"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">상품 *</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm(p => ({ ...p, product_id: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              >
                <option value="">상품 선택</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">별점 *</label>
            <StarPicker value={form.rating} onChange={(v) => setForm(p => ({ ...p, rating: v }))} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">키 (cm)</label>
              <input
                type="number"
                value={form.height}
                onChange={(e) => setForm(p => ({ ...p, height: e.target.value }))}
                placeholder="예: 175"
                min={100} max={250}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">몸무게 (kg)</label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm(p => ({ ...p, weight: e.target.value }))}
                placeholder="예: 65"
                min={30} max={200}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">체형</label>
              <select
                value={form.body_type}
                onChange={(e) => setForm(p => ({ ...p, body_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              >
                <option value="">선택</option>
                {BODY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">제목 (선택)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="리뷰 제목"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">리뷰 내용 *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
              required
              rows={5}
              placeholder="리뷰 내용을 입력하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading || form.rating === 0}
              className="px-5 py-2 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? '등록 중...' : '리뷰 등록'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-5 py-2 border border-gray-300 text-xs rounded hover:border-black"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 border border-gray-300 text-xs rounded hover:border-black transition-colors"
        >
          + 리뷰 직접 작성
        </button>
      )}

      {/* 리뷰 목록 */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-400 text-sm">등록된 리뷰가 없습니다</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {items.map((item) => {
            const displayName = item.admin_author_name || item.author?.display_name || '회원'
            return (
              <div key={item.id} className={`px-4 py-3 ${!item.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StarRating rating={item.rating} />
                      {item.product && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{item.product.name}</span>
                      )}
                      {item.admin_author_name && (
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">직접작성</span>
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
                      {displayName} · {formatDate(item.created_at)}
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
            )
          })}
        </div>
      )}
    </div>
  )
}
