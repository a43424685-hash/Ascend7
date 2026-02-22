'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

type ShopChild = { label: string; href: string }
type ShopNavItem = {
  label: string
  href: string
  children: ShopChild[] | null
}

const SHOP_NAV: ShopNavItem[] = [
  {
    label: 'OUTER',
    href: '/shop?category=outer',
    children: null,
  },
  {
    label: 'TOP',
    href: '/shop?category=top',
    children: [
      { label: 'HOODIE', href: '/shop?category=top&sub=hoodie' },
      { label: 'SWEATER', href: '/shop?category=top&sub=sweater' },
      { label: 'T-SHIRTS', href: '/shop?category=top&sub=tshirts' },
      { label: 'LONG SLEEVE', href: '/shop?category=top&sub=longsleeve' },
      { label: 'SLEEVELESS', href: '/shop?category=top&sub=sleeveless' },
    ],
  },
  {
    label: 'BOTTOM',
    href: '/shop?category=bottom',
    children: [
      { label: 'SHORTS', href: '/shop?category=bottom&sub=shorts' },
      { label: 'PANTS', href: '/shop?category=bottom&sub=pants' },
    ],
  },
  {
    label: 'ACC',
    href: '/shop?category=accessories',
    children: [
      { label: 'CAP', href: '/shop?category=accessories&sub=cap' },
      { label: 'SOCKS', href: '/shop?category=accessories&sub=socks' },
      { label: 'BAG', href: '/shop?category=accessories&sub=bag' },
    ],
  },
  {
    label: 'ALL PRODUCTS',
    href: '/shop',
    children: null,
  },
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

function ShopDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 transition-all duration-200 ${
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
      }`}
    >
      <div className="bg-white border border-gray-100 shadow-lg shadow-black/5 py-5 px-7">
        <div className="flex gap-8">
          {SHOP_NAV.map((item) => (
            <div key={item.label} className="flex flex-col min-w-[72px]">
              <Link
                href={item.href}
                onClick={onClose}
                className="text-[11px] font-bold tracking-[0.15em] text-black hover:text-gray-400 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className="text-[10px] font-medium tracking-[0.08em] text-gray-400 hover:text-black transition-colors whitespace-nowrap"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
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
        <ShopDropdown open={shopOpen} onClose={() => setShopOpen(false)} />
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
