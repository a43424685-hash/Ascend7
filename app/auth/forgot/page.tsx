'use client'

/**
 * 비밀번호 찾기 페이지
 * - 이메일 입력
 * - resetPasswordForEmail() 호출
 * - 비밀번호 재설정 이메일 발송
 */

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/client'
import { Button } from '@/shared/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/reset`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      console.error('Reset password error:', err)
      setError(err.message || '비밀번호 재설정 요청 실패')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <Link href="/" className="text-4xl font-bold tracking-tight">
            ASCEND7
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            비밀번호 찾기
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            가입한 이메일 주소를 입력하세요
          </p>
        </div>

        {success ? (
          /* 성공 메시지 */
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded">
              <h3 className="text-green-800 font-bold mb-2">
                ✅ 이메일이 발송되었습니다!
              </h3>
              <p className="text-green-700 text-sm mb-2">
                <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.
              </p>
              <p className="text-green-600 text-sm">
                이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
              </p>
            </div>

            <div className="text-center space-y-3">
              <Link
                href="/auth/login"
                className="block text-sm text-gray-600 hover:text-black font-semibold"
              >
                ← 로그인 페이지로 돌아가기
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="block w-full text-sm text-gray-500 hover:text-black underline"
              >
                다시 요청하기
              </button>
            </div>
          </div>
        ) : (
          /* 이메일 입력 폼 */
          <>
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded">
                <p className="text-red-800 text-sm font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  가입 시 사용한 이메일 주소를 입력하세요
                </p>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? '전송 중...' : '비밀번호 재설정 이메일 받기'}
                </Button>
              </div>
            </form>

            {/* 로그인으로 돌아가기 */}
            <div className="text-center space-y-3">
              <Link
                href="/auth/login"
                className="block text-sm text-gray-600 hover:text-black font-semibold"
              >
                ← 로그인 페이지로 돌아가기
              </Link>
              <Link
                href="/"
                className="block text-sm text-gray-500 hover:text-black underline"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

