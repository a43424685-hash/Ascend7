'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

// SHOP 드롭다운 아이템
const SHOP_ITEMS = [
  { label: 'ALL PRODUCTS', href: '/shop' },
  { label: 'TOPS', href: '/shop?category=top' },
  { label: 'BOTTOMS', href: '/shop?category=bottom' },
  { label: 'ACCESSORIES', href: '/shop?category=accessories' },
]

export function DesktopNav() {
  const [shopOpen, setShopOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setShopOpen(true)
  }

  const handleMouseLeave = () => {
    // 살짝 딜레이 주어 실수로 닫히지 않게
    closeTimer.current = setTimeout(() => setShopOpen(false), 120)
  }

  return (
    <nav className="hidden lg:flex items-center gap-10">
      {/* SHOP + 드롭다운 */}
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href="/shop"
          className="flex items-center gap-1 text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200 py-1"
        >
          SHOP
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </Link>

        {/* 드롭다운 패널 */}
        <div
          className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 transition-all duration-200 ${
            shopOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
          }`}
        >
          <div className="bg-white border border-gray-100 shadow-lg shadow-black/5 py-2 min-w-[160px]">
            {SHOP_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShopOpen(false)}
                className="flex items-center px-5 py-2.5 text-[11px] font-medium tracking-[0.1em] text-gray-500 hover:text-black hover:bg-gray-50/80 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* NEW ARRIVALS */}
      <Link
        href="/shop?sort=newest"
        className="text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200"
      >
        NEW ARRIVALS
      </Link>

      {/* COMMUNITY */}
      <Link
        href="#"
        className="text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200"
      >
        COMMUNITY
      </Link>
    </nav>
  )
}
