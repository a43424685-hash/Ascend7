import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'

export async function AuthButton() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="p-1"
        aria-label="로그인"
      >
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </Link>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex items-center gap-2">
      {profile?.role === 'admin' && user.email === 'chun8588@naver.com' && (
        <Link
          href="/admin/orders"
          className="hidden lg:block text-[10px] font-bold tracking-wider text-purple-600 hover:text-purple-800 transition-colors"
        >
          ADMIN
        </Link>
      )}
      <Link
        href="/account"
        className="p-1"
        aria-label="내 계정"
      >
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </Link>
    </div>
  )
}
