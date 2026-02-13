import Link from 'next/link'
import { CartButton } from '@/features/cart/cart-button'
import { AuthButton } from '@/features/auth/auth-button'
import { MobileMenuButton, SearchButton } from './mobile-menu'

export async function Header() {
  return (
    <header className="sticky top-0 z-[9990] bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* 로고 */}
          <Link href="/" className="text-lg font-black tracking-[0.15em] shrink-0">
            ASCEND7
          </Link>

          {/* 데스크탑 네비게이션 (lg 이상) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/shop"
              className="text-xs font-semibold tracking-[0.15em] hover:text-gray-500 transition-colors"
            >
              SHOP
            </Link>
            <Link
              href="/shop?category=top"
              className="text-xs font-semibold tracking-[0.15em] hover:text-gray-500 transition-colors"
            >
              TOPS
            </Link>
            <Link
              href="/shop?category=bottom"
              className="text-xs font-semibold tracking-[0.15em] hover:text-gray-500 transition-colors"
            >
              BOTTOMS
            </Link>
            <Link
              href="/shop?category=accessories"
              className="text-xs font-semibold tracking-[0.15em] hover:text-gray-500 transition-colors"
            >
              ACCESSORIES
            </Link>
          </nav>

          {/* 우측 아이콘들 */}
          <div className="flex items-center gap-2.5">
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
