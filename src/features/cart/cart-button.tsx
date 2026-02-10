'use client'

import Link from 'next/link'
import { useCartStorage } from '@/features/cart/use-cart-storage'
import { useEffect } from 'react'

export function CartButton() {
  const { itemCount, isLoaded } = useCartStorage()

  useEffect(() => {
    console.log('🔢 CartButton itemCount:', itemCount, 'isLoaded:', isLoaded)
  }, [itemCount, isLoaded])

  return (
    <Link
      href="/cart"
      className="relative text-sm font-medium hover:underline inline-block"
    >
      CART
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-3 bg-black text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  )
}

