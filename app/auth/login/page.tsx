'use client'

/**
 * 로그인 페이지
 * - 이메일/비밀번호 로그인
 * - 카카오 OAuth 로그인
 * - 회원가입
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/client'
import { Button } from '@/shared/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // 이메일/비밀번호 로그인
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()

      if (isSignUp) {
        // 회원가입
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        if (data.user?.identities?.length === 0) {
          setError('이미 가입된 이메일입니다.')
        } else {
          setMessage('✅ 회원가입 완료! 이메일을 확인해주세요.')
        }
      } else {
        // 로그인
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (!data.user) {
          throw new Error('로그인 실패: 사용자 정보를 찾을 수 없습니다.')
        }

        // 로그인 성공 - 세션 확인
        console.log('✅ Login successful', {
          userId: data.user.id,
          email: data.user.email,
          hasSession: !!data.session,
          sessionToken: data.session?.access_token?.substring(0, 20) + '...',
        })

        // 쿠키 확인
        const cookies = document.cookie.split(';').map(c => c.trim().split('=')[0])
        const supabaseCookies = cookies.filter(name => name.startsWith('sb-'))
        console.log('🍪 Cookies after login:', {
          totalCookies: cookies.length,
          supabaseCookies: supabaseCookies.length,
          cookieNames: supabaseCookies,
        })

        // profiles에서 role 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // role에 따라 리다이렉트 (hard refresh로 서버 컴포넌트가 세션을 인식하도록)
        const redirectUrl = profile?.role === 'admin' ? '/admin/orders' : '/'
        console.log(`🔄 Redirecting to ${redirectUrl}`)
        
        // 약간의 딜레이를 주어 쿠키가 완전히 설정되도록 함
        await new Promise(resolve => setTimeout(resolve, 100))
        
        window.location.href = redirectUrl
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || '로그인 실패')
    } finally {
      setIsLoading(false)
    }
  }

  // 카카오 OAuth 로그인
  const handleKakaoLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error('Kakao login error:', err)
      setError(err.message || '카카오 로그인 실패')
      setIsLoading(false)
    }
    // 리다이렉트되므로 setIsLoading(false) 불필요
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
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? '새 계정을 만드세요' : '계정에 로그인하세요'}
          </p>
        </div>

        {/* 에러/성공 메시지 */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded">
            <p className="text-red-800 text-sm font-semibold">{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-green-50 border-2 border-green-200 p-4 rounded">
            <p className="text-green-800 text-sm font-semibold">{message}</p>
          </div>
        )}

        {/* 이메일/비밀번호 폼 */}
        <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  비밀번호
                </label>
                {!isSignUp && (
                  <Link
                    href="/auth/forgot"
                    className="text-xs text-gray-600 hover:text-black font-semibold"
                  >
                    비밀번호를 잊으셨나요?
                  </Link>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="••••••••"
                disabled={isLoading}
                minLength={6}
              />
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">최소 6자 이상</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
            </Button>
          </div>
        </form>

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
        <div>
          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 bg-[#FEE500] hover:bg-[#FFEB3B] text-gray-900 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.551 1.564 4.787 3.923 6.18l-1.225 4.482c-.105.384.29.7.635.51l5.062-2.772C11.252 18.963 11.622 19 12 19c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
            </svg>
            카카오 로그인
          </button>
        </div>

        {/* 회원가입/로그인 전환 */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setMessage(null)
            }}
            className="text-sm text-gray-600 hover:text-black font-semibold"
            disabled={isLoading}
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
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

