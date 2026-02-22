import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { LogoutButton } from '@/features/auth/logout-button'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const navItems = [
    { href: '/account', label: '내 정보', icon: '👤' },
    { href: '/account/orders', label: '주문 내역', icon: '📦' },
    { href: '/account/wishlist', label: '찜한 상품', icon: '♥' },
    { href: '/account/points', label: '적립금', icon: '⭐' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase mb-1">My Account</p>
            <h1 className="text-2xl font-bold">
              {profile?.display_name ? `${profile.display_name}님의 마이페이지` : '마이페이지'}
            </h1>
          </div>
          <LogoutButton />
        </div>

        <div className="flex gap-8">
          {/* 사이드바 */}
          <aside className="hidden md:block w-48 shrink-0">
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-black hover:bg-white transition-colors rounded-sm"
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* 모바일 탭 */}
          <div className="md:hidden w-full mb-6">
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-gray-600 hover:text-black whitespace-nowrap shrink-0"
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
