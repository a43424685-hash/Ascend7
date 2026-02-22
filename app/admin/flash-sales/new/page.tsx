'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewFlashSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    product_slug: '',
    variant_sku: '',
    sale_price: '',
    original_price: '',
    end_at: '',
    max_quantity: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/flash-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          product_slug: form.product_slug,
          variant_sku: form.variant_sku || null,
          sale_price: parseInt(form.sale_price),
          original_price: parseInt(form.original_price),
          end_at: form.end_at,
          max_quantity: form.max_quantity ? parseInt(form.max_quantity) : null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || '저장 실패')
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

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/flash-sales" className="text-sm text-gray-500 hover:text-black">← 목록</Link>
        <h1 className="text-xl font-bold">플래시 세일 추가</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">세일 제목 *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="예: 오늘만 특가! 후드집업 40% 할인"
            className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">상품 슬러그 *</label>
          <input
            name="product_slug"
            value={form.product_slug}
            onChange={handleChange}
            required
            placeholder="예: ascend7-hoodie"
            className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">바리에이션 SKU (선택)</label>
          <input
            name="variant_sku"
            value={form.variant_sku}
            onChange={handleChange}
            placeholder="예: SKU-001-BLK-M"
            className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">원래 가격 (원) *</label>
            <input
              name="original_price"
              type="number"
              value={form.original_price}
              onChange={handleChange}
              required
              placeholder="89000"
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">세일 가격 (원) *</label>
            <input
              name="sale_price"
              type="number"
              value={form.sale_price}
              onChange={handleChange}
              required
              placeholder="53400"
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">종료 일시 *</label>
            <input
              name="end_at"
              type="datetime-local"
              value={form.end_at}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">최대 판매 수량 (빈칸 = 무제한)</label>
            <input
              name="max_quantity"
              type="number"
              value={form.max_quantity}
              onChange={handleChange}
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
          {loading ? '저장 중...' : '플래시 세일 추가'}
        </button>
      </form>
    </div>
  )
}
