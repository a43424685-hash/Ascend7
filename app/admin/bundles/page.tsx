'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/shared/lib/utils'

interface Bundle {
  id: string
  name: string
  description: string
  product_slugs: string[]
  discount_percent: number
  discount_fixed: number
  min_items: number
  is_active: boolean
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    description: '',
    product_slugs: '',
    discount_percent: '',
    discount_fixed: '',
    min_items: '2',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/bundles')
      .then((r) => r.json())
      .then((d) => { setBundles(d.bundles || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/bundles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        product_slugs: form.product_slugs.split(',').map((s) => s.trim()).filter(Boolean),
        discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : 0,
        discount_fixed: form.discount_fixed ? parseInt(form.discount_fixed) : 0,
        min_items: parseInt(form.min_items),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setBundles((prev) => [data.bundle, ...prev])
      setForm({ name: '', description: '', product_slugs: '', discount_percent: '', discount_fixed: '', min_items: '2' })
      setMessage('번들이 추가되었습니다')
    } else {
      setMessage(data.error || '오류 발생')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/bundles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    setBundles((prev) => prev.map((b) => b.id === id ? { ...b, is_active: !isActive } : b))
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">번들/세트 할인 관리</h1>
      <p className="text-sm text-gray-500 mb-6">여러 상품을 함께 구매할 때 자동 할인을 적용합니다</p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm border border-green-200">{message}</div>
      )}

      {/* 추가 폼 */}
      <div className="bg-white border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-bold mb-4">새 번들 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">번들 이름 *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="예: 운동 세트 패키지"
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">최소 구매 수량</label>
              <input
                type="number"
                value={form.min_items}
                onChange={(e) => setForm({ ...form, min_items: e.target.value })}
                min="2"
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">설명</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="예: 후드집업 + 반바지 함께 구매 시 10% 할인"
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">상품 슬러그 (쉼표로 구분, 비어있으면 모든 상품 적용)</label>
            <input
              value={form.product_slugs}
              onChange={(e) => setForm({ ...form, product_slugs: e.target.value })}
              placeholder="예: ascend7-hoodie, ascend7-shorts (비워두면 장바구니 수량 기준)"
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">할인율 (%)</label>
              <input
                type="number"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                placeholder="10"
                min="0"
                max="100"
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">고정 할인액 (원)</label>
              <input
                type="number"
                value={form.discount_fixed}
                onChange={(e) => setForm({ ...form, discount_fixed: e.target.value })}
                placeholder="5000"
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">※ 할인율과 고정 할인액이 모두 있으면 할인율 우선 적용</p>

          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-2 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '번들 추가'}
          </button>
        </form>
      </div>

      {/* 번들 목록 */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200">
          <p className="text-gray-400">등록된 번들이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.map((bundle) => (
            <div key={bundle.id} className={`border p-4 flex items-center justify-between gap-4 ${bundle.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 ${bundle.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {bundle.is_active ? '활성' : '비활성'}
                  </span>
                  <h3 className="font-semibold text-sm">{bundle.name}</h3>
                </div>
                {bundle.description && <p className="text-xs text-gray-500 mb-1">{bundle.description}</p>}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>최소 {bundle.min_items}개</span>
                  {bundle.discount_percent > 0 && <span className="text-red-500">-{bundle.discount_percent}%</span>}
                  {bundle.discount_fixed > 0 && <span className="text-red-500">-{bundle.discount_fixed.toLocaleString()}원</span>}
                  {bundle.product_slugs?.length > 0 && (
                    <span>대상: {bundle.product_slugs.join(', ')}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleActive(bundle.id, bundle.is_active)}
                className="text-xs text-gray-500 hover:text-black underline shrink-0"
              >
                {bundle.is_active ? '비활성화' : '활성화'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
