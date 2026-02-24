'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'

export function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    sessionStorage.removeItem('ascend7_cart')
    router.push('/auth/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-gray-400 hover:text-white transition-colors"
    >
      로그아웃
    </button>
  )
}
