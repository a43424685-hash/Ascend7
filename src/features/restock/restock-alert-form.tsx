'use client'

import { useState } from 'react'
import { requestRestockAlert } from './actions/request-restock-alert'

interface RestockAlertFormProps {
  variantId: string
  variantLabel: string
}

export function RestockAlertForm({ variantId, variantLabel }: RestockAlertFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await requestRestockAlert(variantId, email)
    setLoading(false)
    if (res.success) {
      setResult({ success: true, message: '재입고 시 이메일로 알려드리겠습니다.' })
    } else {
      setResult({ success: false, message: res.error || '오류가 발생했습니다.' })
    }
  }

  if (result?.success) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm text-center rounded">
        <p className="font-medium">✓ 재입고 알림 신청 완료</p>
        <p className="text-xs mt-0.5 text-green-600">{result.message}</p>
      </div>
    )
  }

  return (
    <div className="p-4 border border-dashed border-gray-300 space-y-2">
      <p className="text-xs text-gray-500 font-medium">
        [{variantLabel}] 재입고 시 이메일로 알려드립니다
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소 입력"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 focus:border-black outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? '...' : '알림 신청'}
        </button>
      </form>
      {result && !result.success && (
        <p className="text-xs text-red-500">{result.message}</p>
      )}
    </div>
  )
}
