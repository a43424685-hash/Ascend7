import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'
import { LogoutButton } from './logout-button'

/**
 * 인증 상태에 따라 로그인/로그아웃 버튼 표시
 * Server Component
 */
export async function AuthButton() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="text-sm font-medium hover:underline"
      >
        LOGIN
      </Link>
    )
  }

  // 로그인한 경우 - role 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex items-center gap-4">
      {/* Admin 링크 (admin인 경우만) */}
      {profile?.role === 'admin' && (
        <Link
          href="/admin/orders"
          className="text-sm font-medium hover:underline text-purple-600"
        >
          👑 ADMIN
        </Link>
      )}

      {/* 사용자 이메일 */}
      <span className="text-sm text-gray-600">
        {user.email?.split('@')[0]}
      </span>

      {/* 로그아웃 버튼 */}
      <LogoutButton />
    </div>
  )
}

