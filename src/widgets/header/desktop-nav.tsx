'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const SHOP_ITEMS = [
  { label: 'ALL PRODUCTS', href: '/shop' },
  { label: 'TOPS', href: '/shop?category=top' },
  { label: 'BOTTOMS', href: '/shop?category=bottom' },
  { label: 'ACCESSORIES', href: '/shop?category=accessories' },
]

const COMMUNITY_ITEMS = [
  { label: 'REVIEW', href: '/community/review' },
  { label: 'LOOK BOOK', href: '/community/lookbook' },
  { label: 'Q&A', href: '/community/qna' },
  { label: 'EVENT', href: '/community/event' },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function DropdownPanel({ items, open, onClose }: { items: { label: string; href: string }[]; open: boolean; onClose: () => void }) {
  return (
    <div
      className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 transition-all duration-200 ${
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
      }`}
    >
      <div className="bg-white border border-gray-100 shadow-lg shadow-black/5 py-2 min-w-[160px]">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center px-5 py-2.5 text-[11px] font-medium tracking-[0.1em] text-gray-500 hover:text-black hover:bg-gray-50/80 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function DesktopNav() {
  const [shopOpen, setShopOpen] = useState(false)
  const [communityOpen, setCommunityOpen] = useState(false)
  const shopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const communityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const makeHandlers = (
    setOpen: (v: boolean) => void,
    timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => ({
    onMouseEnter: () => {
      if (timer.current) clearTimeout(timer.current)
      setOpen(true)
    },
    onMouseLeave: () => {
      timer.current = setTimeout(() => setOpen(false), 120)
    },
  })

  return (
    <nav className="hidden lg:flex items-center gap-10">
      {/* SHOP + 드롭다운 */}
      <div className="relative" {...makeHandlers(setShopOpen, shopTimer)}>
        <Link
          href="/shop"
          className="flex items-center gap-1 text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200 py-1"
        >
          SHOP
          <ChevronIcon open={shopOpen} />
        </Link>
        <DropdownPanel items={SHOP_ITEMS} open={shopOpen} onClose={() => setShopOpen(false)} />
      </div>

      {/* NEW ARRIVALS */}
      <Link
        href="/new-arrivals"
        className="text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200"
      >
        NEW ARRIVALS
      </Link>

      {/* COMMUNITY + 드롭다운 */}
      <div className="relative" {...makeHandlers(setCommunityOpen, communityTimer)}>
        <button className="flex items-center gap-1 text-xs font-medium tracking-[0.12em] text-gray-500 hover:text-black transition-colors duration-200 py-1">
          COMMUNITY
          <ChevronIcon open={communityOpen} />
        </button>
        <DropdownPanel items={COMMUNITY_ITEMS} open={communityOpen} onClose={() => setCommunityOpen(false)} />
      </div>
    </nav>
  )
}
