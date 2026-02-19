import Link from 'next/link'
import { CartButton } from '@/features/cart/cart-button'
import { AuthButton } from '@/features/auth/auth-button'
import { MobileMenuButton, SearchButton } from './mobile-menu'

export async function Header() {
  return (
    <header className="sticky top-0 z-[9990] bg-white/98 backdrop-blur-sm border-b border-gray-100/80">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="text-sm font-black tracking-[0.25em] shrink-0 hover:opacity-70 transition-opacity">
            ASCEND7
          </Link>

          {/* 데스크탑 네비게이션 (lg 이상) */}
          <nav className="hidden lg:flex items-center gap-10">
            <Link href="/shop" className="text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200">SHOP</Link>
            <Link href="/shop?category=top" className="text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200">TOPS</Link>
            <Link href="/shop?category=bottom" className="text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200">BOTTOMS</Link>
            <Link href="/shop?category=accessories" className="text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200">ACCESSORIES</Link>
          </nav>

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
