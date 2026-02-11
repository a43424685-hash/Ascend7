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

      // 로그아웃 성공 - 홈으로 리다이렉트
      router.push('/')
      router.refresh()
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

