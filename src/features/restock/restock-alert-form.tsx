'use client'

import { useState, useEffect } from 'react'
import { requestRestockAlert } from './actions/request-restock-alert'
import { getAuthUserEmail } from './actions/get-user-email'

interface RestockAlertFormProps {
  variantId: string
  variantLabel: string
}

const KAKAO_CHANNEL_URL = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || ''

export function RestockAlertForm({ variantId, variantLabel }: RestockAlertFormProps) {
  const [tab, setTab] = useState<'email' | 'kakao'>('email')
  const [email, setEmail] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // 로그인 상태 + 이메일 자동 가져오기
  useEffect(() => {
    getAuthUserEmail().then((email) => {
      if (email) {
        setUserEmail(email)
        setIsLoggedIn(true)
        setEmail(email)
      }
    })
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await requestRestockAlert(variantId, 'email', isLoggedIn ? undefined : email)
    setLoading(false)
    if (res.success) {
      setResult({ success: true, message: '재입고 시 이메일로 알려드리겠습니다.' })
    } else {
      setResult({ success: false, message: res.error || '오류가 발생했습니다.' })
    }
  }

  const handleKakaoClick = async () => {
    // 카카오 채널 열기
    if (KAKAO_CHANNEL_URL) {
      window.open(KAKAO_CHANNEL_URL, '_blank', 'noopener')
    }
    // DB에 카카오 알림 신청 기록
    setLoading(true)
    const res = await requestRestockAlert(variantId, 'kakao')
    setLoading(false)
    if (res.success) {
      setResult({
        success: true,
        message: KAKAO_CHANNEL_URL
          ? '채널 추가 후 재입고 시 메시지를 보내드립니다.'
          : '카카오 알림 신청이 완료되었습니다.',
      })
    } else {
      setResult({ success: false, message: res.error || '오류가 발생했습니다.' })
    }
  }

  if (result?.success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 text-sm">
        <p className="font-medium text-green-700">✓ 재입고 알림 신청 완료</p>
        <p className="text-xs mt-1 text-green-600">
          [{variantLabel}] {result.message}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-dashed border-gray-300 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs font-semibold text-gray-700">
          재입고 알림 신청
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          [{variantLabel}] 재입고 시 알림을 보내드립니다
        </p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 mx-4">
        <button
          onClick={() => setTab('email')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            tab === 'email'
              ? 'border-black text-black'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          이메일 알림
        </button>
        <button
          onClick={() => setTab('kakao')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            tab === 'kakao'
              ? 'border-[#FEE500] text-[#3A1D1D]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.5 5.1 3.8 6.6L4.9 21l4.3-2.8c.9.2 1.8.3 2.8.3 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z" />
          </svg>
          카카오톡 알림
        </button>
      </div>

      {/* 탭 내용 */}
      <div className="p-4">
        {tab === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 text-sm">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 text-xs truncate">{userEmail}</span>
                <span className="text-xs text-gray-400 shrink-0">로 발송</span>
              </div>
            ) : (
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                className="w-full px-3 py-2 text-sm border border-gray-300 focus:border-black outline-none"
              />
            )}
            {result && !result.success && (
              <p className="text-xs text-red-500">{result.message}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? '신청 중...' : '이메일 알림 신청'}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {KAKAO_CHANNEL_URL ? (
              <>
                <p className="text-xs text-gray-500">
                  ASCEND7 카카오톡 채널을 추가하면 재입고 시 메시지를 보내드립니다.
                </p>
                {isLoggedIn && (
                  <p className="text-xs text-gray-400">
                    로그인 계정({userEmail})과 연결됩니다.
                  </p>
                )}
                {result && !result.success && (
                  <p className="text-xs text-red-500">{result.message}</p>
                )}
                <button
                  onClick={handleKakaoClick}
                  disabled={loading}
                  className="w-full py-2.5 text-sm font-semibold bg-[#FEE500] text-[#3A1D1D] hover:bg-[#f5dc00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.5 5.1 3.8 6.6L4.9 21l4.3-2.8c.9.2 1.8.3 2.8.3 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z" />
                  </svg>
                  {loading ? '신청 중...' : '카카오톡 채널 추가하기'}
                </button>
              </>
            ) : (
              <p className="text-xs text-gray-400 text-center py-2">
                카카오톡 알림 기능은 준비 중입니다.
                <br />이메일 알림을 이용해주세요.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
