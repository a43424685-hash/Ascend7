import Link from 'next/link'
import { CartButton } from '@/features/cart/cart-button'
import { AuthButton } from '@/features/auth/auth-button'
import { MobileMenuButton, SearchButton } from './mobile-menu'
import { DesktopNav } from './desktop-nav'

export async function Header() {
  return (
    <header className="sticky top-0 z-[9990] bg-white/98 backdrop-blur-sm border-b border-gray-100/80">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center shrink-0 hover:opacity-70 transition-opacity">
            <span className="text-sm font-black tracking-[0.25em]">ASCEND7</span>
          </Link>

          {/* 데스크탑 네비게이션 - DesktopNav (SHOP 드롭다운 포함) */}
          <DesktopNav />

          {/* 우측 아이콘들 */}
          <div className="flex items-center gap-3">
            <AuthButton />
            <CartButton />
            <SearchButton />
            <MobileMenuButton />
          </div>
        </div>
      </div>
    </header>
  )
}
