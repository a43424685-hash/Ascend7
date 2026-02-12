'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { changePassword } from './actions'

export function PasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('new_password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' })
      setIsSubmitting(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '비밀번호는 6자 이상이어야 합니다.' })
      setIsSubmitting(false)
      return
    }

    const result = await changePassword(newPassword)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' })
      // 폼 초기화
      e.currentTarget.reset()
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded ${
            message.type === 'error'
              ? 'bg-red-50 border-2 border-red-200'
              : 'bg-green-50 border-2 border-green-200'
          }`}
        >
          <p
            className={`text-sm ${
              message.type === 'error' ? 'text-red-800' : 'text-green-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="new_password" className="block text-sm font-semibold text-gray-700 mb-1">
          새 비밀번호
        </label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          required
          minLength={6}
          placeholder="6자 이상"
          className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>

      <div>
        <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 mb-1">
          새 비밀번호 확인
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          minLength={6}
          placeholder="비밀번호 다시 입력"
          className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '변경 중...' : '비밀번호 변경'}
      </Button>
    </form>
  )
}
