'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'
import { useState } from 'react'

/**
 * 로그아웃 버튼 (Client Component)
 */
export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        alert('로그아웃 실패')
        return
      }

      // 장바구니 클리어 (로그인 상태에서 담은 항목 제거)
      sessionStorage.removeItem('itero7_cart')

      // 로그아웃 성공 - 홈으로 리다이렉트 (hard refresh로 서버 컴포넌트가 세션 제거를 인식)
      window.location.href = '/'
    } catch (err) {
      console.error('Logout error:', err)
      alert('로그아웃 실패')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="text-sm font-medium hover:underline disabled:opacity-50"
    >
      {isLoading ? '...' : 'LOGOUT'}
    </button>
  )
}

