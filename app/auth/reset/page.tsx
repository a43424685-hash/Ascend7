'use client'

/**
 * 비밀번호 재설정 페이지
 * - 이메일 링크를 통해 접근
 * - 새 비밀번호 입력
 * - supabase.auth.updateUser({ password }) 사용
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/client'
import { Button } from '@/shared/ui/button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  // 페이지 로드 시 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('유효하지 않은 접근입니다. 비밀번호 재설정 이메일의 링크를 다시 확인하세요.')
        setIsValidSession(false)
      } else {
        setIsValidSession(true)
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err: any) {
      console.error('Update password error:', err)
      setError(err.message || '비밀번호 변경 실패')
    } finally {
      setIsLoading(false)
    }
  }

  // 세션 확인 중
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-black"></div>
          <p className="mt-4 text-gray-600">확인 중...</p>
        </div>
      </div>
    )
  }

  // 유효하지 않은 세션
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="text-4xl font-bold tracking-tight">
              ASCEND7
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              비밀번호 재설정
            </h2>
          </div>

          <div className="bg-red-50 border-2 border-red-200 p-6 rounded">
            <h3 className="text-red-800 font-bold mb-2">❌ 접근 오류</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
          </div>

          <div className="text-center space-y-3">
            <Link
              href="/auth/forgot"
              className="block text-sm text-gray-600 hover:text-black font-semibold"
            >
              비밀번호 재설정 다시 요청하기
            </Link>
            <Link
              href="/auth/login"
              className="block text-sm text-gray-500 hover:text-black underline"
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
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
            새 비밀번호 설정
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            새로운 비밀번호를 입력하세요
          </p>
        </div>

        {success ? (
          /* 성공 메시지 */
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded">
              <h3 className="text-green-800 font-bold mb-2">
                ✅ 비밀번호가 변경되었습니다!
              </h3>
              <p className="text-green-700 text-sm mb-2">
                새 비밀번호로 로그인할 수 있습니다.
              </p>
              <p className="text-green-600 text-sm">
                잠시 후 로그인 페이지로 이동합니다...
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="block text-sm text-gray-600 hover:text-black font-semibold"
              >
                → 지금 로그인하기
              </Link>
            </div>
          </div>
        ) : (
          /* 비밀번호 입력 폼 */
          <>
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded">
                <p className="text-red-800 text-sm font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    새 비밀번호
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="••••••••"
                    disabled={isLoading}
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-500">최소 6자 이상</p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="••••••••"
                    disabled={isLoading}
                    minLength={6}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">비밀번호가 일치하지 않습니다</p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || password !== confirmPassword}
                >
                  {isLoading ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </div>
            </form>

            {/* 로그인으로 돌아가기 */}
            <div className="text-center">
              <Link
                href="/auth/login"
                className="block text-sm text-gray-500 hover:text-black underline"
              >
                ← 로그인 페이지로 돌아가기
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

