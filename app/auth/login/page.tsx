'use client'

/**
 * 로그인 페이지
 * - 이메일/비밀번호 로그인 (Route Handler)
 * - 카카오 OAuth 로그인
 * - 회원가입 (Server Action)
 */

import { useState, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/client'
import { Button } from '@/shared/ui/button'
import { loginAction, signUpAction } from './actions'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isKakaoLoading, setIsKakaoLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [socialError, setSocialError] = useState<string | null>(null)

  // 로그인 Server Action 상태 관리
  const [loginState, loginFormAction] = useFormState(loginAction, undefined)

  // 회원가입 Server Action 상태 관리
  const [signUpState, signUpFormAction] = useFormState(signUpAction, undefined)

  // 이미 로그인된 사용자는 원래 가려던 페이지로 리다이렉트
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const searchParams = new URLSearchParams(window.location.search)
      if (user) {
        // ?redirect 파라미터가 있으면 해당 페이지로, 없으면 마이페이지로
        const redirectTo = searchParams.get('redirect') || '/account'
        router.replace(redirectTo)
      } else {
        // OAuth 콜백 에러 처리
        const errorParam = searchParams.get('error')
        if (errorParam === 'already_registered') {
          setSocialError('이미 가입된 계정입니다. 로그인 해주세요.')
          setIsSignUp(false)
        } else if (errorParam === 'no_account') {
          setSocialError('가입된 계정이 없습니다. 회원가입을 먼저 해주세요.')
          setIsSignUp(true)
        }
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // 인증 체크 중일 때 로딩 표시
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 구글 OAuth
  const handleGoogleLogin = async () => {
    setSocialError(null)
    setIsGoogleLoading(true)
    const intent = isSignUp ? 'signup' : 'login'

    try {
      const supabase = createClient()
      const searchParams = new URLSearchParams(window.location.search)
      const redirectParam = searchParams.get('redirect')
      const callbackUrl = redirectParam
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectParam)}&intent=${intent}`
        : `${window.location.origin}/auth/callback?intent=${intent}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: { prompt: 'select_account' },
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error('Google login error:', err)
      setIsGoogleLoading(false)
    }
  }

  // 카카오 OAuth
  const handleKakaoLogin = async () => {
    setSocialError(null)
    setIsKakaoLoading(true)
    const intent = isSignUp ? 'signup' : 'login'

    try {
      const supabase = createClient()
      const searchParams = new URLSearchParams(window.location.search)
      const redirectParam = searchParams.get('redirect')
      const callbackUrl = redirectParam
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectParam)}&intent=${intent}`
        : `${window.location.origin}/auth/callback?intent=${intent}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: callbackUrl,
          queryParams: { prompt: 'login' },
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error('Kakao login error:', err)
      setIsKakaoLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <Link href="/" className="text-4xl font-bold tracking-tight">
            ITERO7
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? '새 계정을 만드세요' : '계정에 로그인하세요'}
          </p>
        </div>

        {/* 소셜 로그인 에러 */}
        {socialError && (
          <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded">
            <p className="text-amber-800 text-sm font-semibold">⚠️ {socialError}</p>
          </div>
        )}

        {/* 에러/성공 메시지 */}
        {(loginState?.error || signUpState?.error) && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded">
            <p className="text-red-800 text-sm font-semibold">
              {isSignUp ? signUpState?.error : loginState?.error}
            </p>
          </div>
        )}
        {signUpState && 'success' in signUpState && signUpState.success && (
          <div className="bg-green-50 border-2 border-green-200 p-4 rounded">
            <p className="text-green-800 text-sm font-semibold">✅ {signUpState.message}</p>
          </div>
        )}

        {/* 이메일/비밀번호 폼 - 로그인과 회원가입 완전 분리 */}
        {!isSignUp ? (
          // 로그인 폼 (Server Action 사용)
          <form action={loginFormAction} className="mt-8 space-y-6">
            <div className="space-y-4">
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
                  disabled={isKakaoLoading}
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    비밀번호
                  </label>
                  <Link
                    href="/auth/forgot"
                    className="text-xs text-gray-600 hover:text-black font-semibold"
                  >
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isKakaoLoading}
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isKakaoLoading}
              >
                로그인
              </Button>
            </div>
          </form>
        ) : (
          // 회원가입 폼 (Server Action 방식)
          <form action={signUpFormAction} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isKakaoLoading}
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  disabled={isKakaoLoading}
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">최소 6자 이상</p>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isKakaoLoading}
              >
                회원가입
              </Button>
            </div>
          </form>
        )}

        {/* 구분선 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">또는</span>
          </div>
        </div>

        {/* 카카오 로그인 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={isKakaoLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 bg-[#FEE500] hover:bg-[#FFEB3B] text-gray-900 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.551 1.564 4.787 3.923 6.18l-1.225 4.482c-.105.384.29.7.635.51l5.062-2.772C11.252 18.963 11.622 19 12 19c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
            </svg>
            {isKakaoLoading ? '처리 중...' : isSignUp ? '카카오로 회원가입' : '카카오 로그인'}
          </button>

          {/* 구글 로그인 */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isKakaoLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading ? '처리 중...' : isSignUp ? '구글로 회원가입' : '구글로 로그인'}
          </button>
        </div>

        {/* 회원가입/로그인 전환 */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-600 hover:text-black font-semibold"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>

        {/* 비회원 주문조회 */}
        <div className="text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 mb-2">로그인 없이 주문을 확인하고 싶으신가요?</p>
          <Link href="/guest/orders">
            <Button variant="outline" size="sm" className="w-full">
              비회원 주문 조회
            </Button>
          </Link>
        </div>

        {/* 홈으로 */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-black underline"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

