'use client'

import Link from 'next/link'
import { useCart } from '@/features/cart/cart-context'

export function CartButton() {
  const { itemCount, isLoaded } = useCart()

  return (
    <Link
      href="/cart"
      className="relative text-sm font-medium hover:underline inline-block"
    >
      CART
      {isLoaded && itemCount > 0 && (
        <span className="absolute -top-2 -right-3 bg-black text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
