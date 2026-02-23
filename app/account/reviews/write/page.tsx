'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { submitReview } from '@/features/review/actions/submit-review'

const BODY_TYPES = ['마른 편', '보통', '통통한 편', '근육질', '기타']

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
          <svg className={`w-8 h-8 transition-colors ${s <= (hover || value) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {value > 0 && <span className="ml-1 text-sm text-gray-500 self-center">{value}점</span>}
    </div>
  )
}

export default function WriteReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('product_id') ?? ''
  const productName = searchParams.get('product_name') ?? '상품'
  const orderId = searchParams.get('order_id') ?? ''

  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!productId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">잘못된 접근입니다.</p>
        <Link href="/account/orders" className="text-sm underline">주문 내역으로 돌아가기</Link>
      </div>
    )
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = 5 - images.length
    const selected = files.slice(0, remaining)
    setImages(prev => [...prev, ...selected])
    const newPreviews = selected.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (rating === 0) { setError('별점을 선택해주세요.'); return }
    if (!content.trim()) { setError('리뷰 내용을 입력해주세요.'); return }

    setSubmitting(true)
    try {
      let imageUrls: string[] = []

      // 이미지 업로드
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

      const result = await submitReview({
        product_id: productId,
        rating,
        title: title || undefined,
        content,
        image_urls: imageUrls,
        height: height ? parseInt(height) : null,
        weight: weight ? parseInt(weight) : null,
        body_type: bodyType || null,
      })

      if (!result.success) {
        setError(result.error || '리뷰 등록 실패')
        return
      }

      router.push(orderId ? `/account/orders/${orderId}?reviewed=1` : '/account/orders')
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href={orderId ? `/account/orders/${orderId}` : '/account/orders'}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← 주문 상세로 돌아가기
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-1">리뷰 작성</h2>
      <p className="text-sm text-gray-500 mb-6">{productName}</p>

      {/* 포인트 안내 */}
      <div className="bg-amber-50 border border-amber-100 rounded-sm px-4 py-3 mb-6 text-xs text-amber-800">
        ⭐ 텍스트 리뷰 <span className="font-semibold">1,000P</span> · 사진 첨부 리뷰 <span className="font-semibold">2,000P</span> 자동 적립
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 별점 */}
        <div>
          <label className="block text-sm font-medium mb-2">별점 *</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* 이미지 첨부 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            사진 첨부 <span className="text-xs text-gray-400 font-normal">(최대 5장, JPG/PNG/WEBP, 5MB 이하)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 shrink-0">
                <img src={src} alt="" className="w-full h-full object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 transition-colors"
              >
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[10px]">사진 추가</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        {/* 체형 정보 */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">키 (cm)</label>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="예: 175"
              min={100} max={250}
              className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">몸무게 (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="예: 65"
              min={30} max={200}
              className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">체형</label>
            <select
              value={bodyType}
              onChange={e => setBodyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black"
            >
              <option value="">선택</option>
              {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium mb-1">제목 (선택)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="리뷰 제목"
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium mb-1">리뷰 내용 *</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={5}
            placeholder="상품에 대한 솔직한 리뷰를 남겨주세요."
            className="w-full px-3 py-2 border border-gray-300 text-sm outline-none focus:border-black resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-black text-white py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {uploading ? '이미지 업로드 중...' : submitting ? '등록 중...' : '리뷰 등록하기'}
          </button>
          <Link
            href={orderId ? `/account/orders/${orderId}` : '/account/orders'}
            className="px-6 py-3 border border-gray-300 text-sm hover:border-black transition-colors"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
