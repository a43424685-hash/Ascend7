'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toggleReviewActive, deleteReview, createReviewByAdmin } from '@/features/admin/actions/review-management'
import { adminAdjustPoints } from '@/features/points/actions/admin-adjust-points'

interface ReviewItem {
  id: string
  user_id: string
  rating: number
  title: string | null
  content: string
  is_active: boolean
  created_at: string
  admin_author_name: string | null
  image_urls?: string[] | null
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
        <button key={s} type="button" onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} className="focus:outline-none">
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

// 리뷰별 포인트 인라인 조정 컴포넌트
function PointAdjustInline({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const handleSubmit = async () => {
    const num = parseInt(amount)
    if (!num || !desc.trim()) return
    setLoading(true)
    const res = await adminAdjustPoints(userId, num, desc)
    setLoading(false)
    setMsg({ text: res.success ? `완료: ${num > 0 ? '+' : ''}${num.toLocaleString()}P` : res.error || '오류', ok: res.success })
    if (res.success) { setAmount(''); setDesc('') }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-blue-500 hover:underline">포인트 조정</button>
    )
  }

  return (
    <div className="mt-2 p-2.5 bg-blue-50 border border-blue-100 rounded text-xs space-y-1.5">
      <p className="font-medium text-blue-700 text-[11px]">포인트 수동 조정 (양수=지급, 음수=회수)</p>
      <div className="flex gap-1.5">
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="예: 1000 또는 -1000"
          className="flex-1 px-2 py-1 border border-blue-200 text-xs outline-none focus:border-blue-500"
        />
      </div>
      <input
        type="text"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="사유 (예: 포토리뷰 포인트 누락)"
        className="w-full px-2 py-1 border border-blue-200 text-xs outline-none focus:border-blue-500"
      />
      {msg && <p className={`text-[11px] ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>}
      <div className="flex gap-1.5">
        <button
          onClick={handleSubmit}
          disabled={loading || !amount || !desc}
          className="px-3 py-1 bg-blue-600 text-white text-[11px] rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '처리 중...' : '적용'}
        </button>
        <button onClick={() => { setOpen(false); setMsg(null) }} className="px-3 py-1 border border-blue-200 text-[11px] rounded hover:border-blue-400">닫기</button>
      </div>
    </div>
  )
}

export function ReviewManager({ items, products }: ReviewManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const selected = files.slice(0, 5 - images.length)
    setImages(prev => [...prev, ...selected])
    setPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))])
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => { URL.revokeObjectURL(prev[idx]); return prev.filter((_, i) => i !== idx) })
  }

  const resetForm = () => {
    setIsAdding(false)
    setImages([])
    setPreviews([])
    setForm({ admin_author_name: '', product_id: '', rating: 0, title: '', content: '', height: '', weight: '', body_type: '' })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      let imageUrls: string[] = []
      if (images.length > 0) {
        setUploading(true)
        const formData = new FormData()
        images.forEach(f => formData.append('files', f))
        const res = await fetch('/api/upload/review-image', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) { setError(data.error || '이미지 업로드 실패'); return }
        imageUrls = data.urls
        setUploading(false)
      }
      const result = await createReviewByAdmin({
        admin_author_name: form.admin_author_name,
        product_id: form.product_id,
        rating: form.rating,
        title: form.title || undefined,
        content: form.content,
        image_urls: imageUrls,
        height: form.height ? parseInt(form.height) : null,
        weight: form.weight ? parseInt(form.weight) : null,
        body_type: form.body_type || null,
      })
      if (result.success) { resetForm(); router.refresh() }
      else setError(result.error || '오류가 발생했습니다.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      setUploading(false)
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
              <input type="text" value={form.admin_author_name} onChange={e => setForm(p => ({ ...p, admin_author_name: e.target.value }))} required placeholder="예: 홍길**" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">상품 *</label>
              <select value={form.product_id} onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black">
                <option value="">상품 선택</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">별점 *</label>
            <StarPicker value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
          </div>
          {/* 이미지 첨부 */}
          <div>
            <label className="block text-xs font-medium mb-2">사진 첨부 <span className="text-gray-400 font-normal">(최대 5장)</span></label>
            <div className="flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative w-16 h-16 shrink-0">
                  <img src={src} alt="" className="w-full h-full object-cover border border-gray-200 rounded" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">×</button>
                </div>
              ))}
              {images.length < 5 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 rounded text-[10px] gap-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  추가
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden" onChange={handleImageSelect} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">키 (cm)</label>
              <input type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} placeholder="예: 175" min={100} max={250} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">몸무게 (kg)</label>
              <input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="예: 65" min={30} max={200} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">체형</label>
              <select value={form.body_type} onChange={e => setForm(p => ({ ...p, body_type: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black">
                <option value="">선택</option>
                {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">제목 (선택)</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="리뷰 제목" maxLength={100} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">리뷰 내용 *</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required rows={5} placeholder="리뷰 내용을 입력하세요..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:border-black" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading || form.rating === 0} className="px-5 py-2 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50">
              {uploading ? '이미지 업로드 중...' : loading ? '등록 중...' : '리뷰 등록'}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2 border border-gray-300 text-xs rounded hover:border-black">취소</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)} className="px-4 py-2 border border-gray-300 text-xs rounded hover:border-black transition-colors">
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
            const hasImages = item.image_urls && item.image_urls.length > 0
            const isRealUser = !item.admin_author_name

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
                      {hasImages && (
                        <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">📷 포토</span>
                      )}
                      {!item.is_active && (
                        <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded">숨김</span>
                      )}
                    </div>
                    {item.title && <p className="text-sm font-medium text-gray-800 mb-0.5">{item.title}</p>}
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item.content}</p>

                    {/* 리뷰 이미지 썸네일 */}
                    {hasImages && (
                      <div className="flex gap-1 mt-1.5">
                        {item.image_urls!.slice(0, 5).map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt="" className="w-12 h-12 object-cover rounded border border-gray-100 hover:opacity-80 transition-opacity" />
                          </a>
                        ))}
                        {item.image_urls!.length > 5 && (
                          <div className="w-12 h-12 bg-gray-100 rounded border border-gray-100 flex items-center justify-center text-[10px] text-gray-500">
                            +{item.image_urls!.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-[11px] text-gray-400 mt-1">{displayName} · {formatDate(item.created_at)}</p>

                    {/* 포인트 수동 조정 (실제 유저 리뷰만) */}
                    {isRealUser && item.user_id && (
                      <PointAdjustInline userId={item.user_id} />
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => run(() => toggleReviewActive(item.id, !item.is_active))} disabled={loading} className="text-xs text-gray-500 hover:underline">
                      {item.is_active ? '숨기기' : '공개'}
                    </button>
                    <button onClick={() => { if (confirm('이 리뷰를 삭제하시겠습니까?')) run(() => deleteReview(item.id)) }} disabled={loading} className="text-xs text-red-500 hover:underline">
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
