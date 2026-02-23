'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/shared/lib/utils'

export default function EditFlashSalePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [title, setTitle] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [endAt, setEndAt] = useState('')
  const [maxQuantity, setMaxQuantity] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [productName, setProductName] = useState('')
  const [variantInfo, setVariantInfo] = useState('')

  useEffect(() => {
    fetch(`/api/admin/flash-sales/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) return
        setTitle(data.title ?? '')
        setSalePrice(String(data.sale_price ?? ''))
        setOriginalPrice(String(data.original_price ?? ''))
        // datetime-local 형식으로 변환 (UTC→로컬)
        if (data.end_at) {
          const d = new Date(data.end_at)
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          setEndAt(local.toISOString().slice(0, 16))
        }
        setMaxQuantity(data.max_quantity != null ? String(data.max_quantity) : '')
        setIsActive(data.is_active ?? true)
        setProductName(data.product_name ?? '')
        setVariantInfo(data.variant_info ?? '')
      })
      .finally(() => setFetching(false))
  }, [params.id])

  const discountPct = salePrice && originalPrice
    ? Math.round((1 - parseInt(salePrice) / parseInt(originalPrice)) * 100)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/flash-sales/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          sale_price: parseInt(salePrice),
          original_price: parseInt(originalPrice),
          end_at: endAt,
          max_quantity: maxQuantity ? parseInt(maxQuantity) : null,
          is_active: isActive,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || '수정 실패')
        return
      }
      router.push('/admin/flash-sales')
      router.refresh()
    } catch {
      alert('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="text-sm text-gray-400 py-12 text-center">불러오는 중...</div>
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/flash-sales" className="text-sm text-gray-500 hover:text-black">← 목록</Link>
        <h1 className="text-xl font-bold">타임딜 수정</h1>
      </div>

      {/* 상품 정보 (읽기 전용) */}
      {productName && (
        <div className="bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs mb-5">
          <p className="text-gray-500 mb-0.5">상품 (변경 불가)</p>
          <p className="font-medium text-gray-800">
            {productName}{variantInfo && <span className="text-gray-500 ml-2">{variantInfo}</span>}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 활성화 토글 */}
        <div className="flex items-center justify-between py-3 border border-gray-200 px-4 rounded-sm">
          <div>
            <p className="text-sm font-medium">타임딜 활성화</p>
            <p className="text-xs text-gray-400 mt-0.5">비활성화하면 즉시 숨겨집니다</p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-black' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isActive ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">세일 제목 *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        {/* 가격 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">원가 (원) *</label>
            <input
              type="number"
              value={originalPrice}
              onChange={e => setOriginalPrice(e.target.value)}
              required
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">세일 가격 (원) *</label>
            <input
              type="number"
              value={salePrice}
              onChange={e => setSalePrice(e.target.value)}
              required
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {/* 할인율 미리보기 */}
        {discountPct > 0 && (
          <p className="text-xs text-red-600 font-medium">⚡ 할인율: {discountPct}% OFF</p>
        )}

        {/* 종료 시간 / 최대 수량 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">종료 일시 *</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={e => setEndAt(e.target.value)}
              required
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">최대 수량 (빈칸=무제한)</label>
            <input
              type="number"
              value={maxQuantity}
              onChange={e => setMaxQuantity(e.target.value)}
              placeholder="100"
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? '저장 중...' : '수정 저장'}
        </button>
      </form>
    </div>
  )
}
