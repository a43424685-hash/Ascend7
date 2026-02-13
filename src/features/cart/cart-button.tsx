'use client'

import Link from 'next/link'
import { useCart } from '@/features/cart/cart-context'

export function CartButton() {
  const { itemCount, isLoaded } = useCart()

  return (
    <Link
      href="/cart"
      className="relative p-1"
      aria-label="장바구니"
    >
      {/* 쇼핑백 아이콘 */}
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      {isLoaded && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
