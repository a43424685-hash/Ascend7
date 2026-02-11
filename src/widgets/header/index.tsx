import Link from 'next/link'
import { CartButton } from '@/features/cart/cart-button'
import { AuthButton } from '@/features/auth/auth-button'

export async function Header() {
  return (
    <header className="border-b border-black">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            ASCEND7
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/shop"
              className="text-sm font-medium hover:underline"
            >
              SHOP
            </Link>
            <Link
              href="/account"
              className="text-sm font-medium hover:underline"
            >
              ACCOUNT
            </Link>
            <CartButton />
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  )
}

