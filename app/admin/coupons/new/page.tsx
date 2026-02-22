'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCoupon } from '@/features/coupon/actions/create-coupon'
import { Button } from '@/shared/ui/button'

export default function NewCouponPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    expires_at: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createCoupon({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : undefined,
        max_discount_amount:
          form.type === 'percentage' && form.max_discount_amount
            ? Number(form.max_discount_amount)
            : undefined,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      })
      router.push('/admin/coupons')
    } catch (err) {
      setError(err instanceof Error ? err.message : '쿠폰 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">쿠폰 생성</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1">쿠폰 코드 *</label>
          <input
            type="text"
            required
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none font-mono uppercase tracking-wider"
            placeholder="예: WELCOME10"
          />
          <p className="text-xs text-gray-400 mt-1">영문/숫자, 대문자로 자동 변환됩니다.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">할인 유형 *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="percentage"
                checked={form.type === 'percentage'}
                onChange={() => setForm((p) => ({ ...p, type: 'percentage', max_discount_amount: '' }))}
              />
              <span className="text-sm">퍼센트 할인 (%)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="fixed"
                checked={form.type === 'fixed'}
                onChange={() => setForm((p) => ({ ...p, type: 'fixed', max_discount_amount: '' }))}
              />
              <span className="text-sm">정액 할인 (원)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            할인 값 * {form.type === 'percentage' ? '(%)' : '(원)'}
          </label>
          <input
            type="number"
            required
            min={1}
            max={form.type === 'percentage' ? 100 : undefined}
            value={form.value}
            onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
            placeholder={form.type === 'percentage' ? '예: 10 (10%)' : '예: 5000 (5,000원)'}
          />
        </div>

        {form.type === 'percentage' && (
          <div>
            <label className="block text-sm font-semibold mb-1">최대 할인 금액 (원, 선택)</label>
            <input
              type="number"
              min={0}
              value={form.max_discount_amount}
              onChange={(e) => setForm((p) => ({ ...p, max_discount_amount: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
              placeholder="예: 10000 (최대 10,000원 할인)"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1">최소 주문 금액 (원, 선택)</label>
          <input
            type="number"
            min={0}
            value={form.min_order_amount}
            onChange={(e) => setForm((p) => ({ ...p, min_order_amount: e.target.value }))}
            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
            placeholder="예: 30000 (30,000원 이상 주문 시)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">사용 횟수 제한 (선택, 미입력 시 무제한)</label>
          <input
            type="number"
            min={1}
            value={form.usage_limit}
            onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))}
            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
            placeholder="예: 100 (100회 사용 후 만료)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">만료일 (선택)</label>
          <input
            type="datetime-local"
            value={form.expires_at}
            onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? '생성 중...' : '쿠폰 생성'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/coupons')}
            disabled={loading}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  )
}
