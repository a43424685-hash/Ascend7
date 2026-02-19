import Link from 'next/link'
import { CartButton } from '@/features/cart/cart-button'
import { AuthButton } from '@/features/auth/auth-button'
import { MobileMenuButton, SearchButton } from './mobile-menu'

export async function Header() {
  return (
    <header className="sticky top-0 z-[9990] bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 - 골드 "7" 강조 */}
          <Link href="/" className="text-lg font-black tracking-[0.2em] shrink-0 group">
            ASCEND<span className="text-[#C9A84C] group-hover:text-[#B8941F] transition-colors duration-200">7</span>
          </Link>

          {/* 데스크탑 네비게이션 (lg 이상) */}
          <nav className="hidden lg:flex items-center gap-10">
            <Link href="/shop" className="relative text-xs font-semibold tracking-[0.18em] text-gray-800 hover:text-black transition-colors group py-1">
              SHOP
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#C9A84C] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/shop?category=top" className="relative text-xs font-semibold tracking-[0.18em] text-gray-800 hover:text-black transition-colors group py-1">
              TOPS
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#C9A84C] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/shop?category=bottom" className="relative text-xs font-semibold tracking-[0.18em] text-gray-800 hover:text-black transition-colors group py-1">
              BOTTOMS
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#C9A84C] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/shop?category=accessories" className="relative text-xs font-semibold tracking-[0.18em] text-gray-800 hover:text-black transition-colors group py-1">
              ACCESSORIES
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#C9A84C] group-hover:w-full transition-all duration-300" />
            </Link>
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
