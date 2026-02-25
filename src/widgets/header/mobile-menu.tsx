'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'

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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [shopOpen, setShopOpen] = useState(true)
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const checkRole = async (userId?: string) => {
      if (!userId) { setIsAdmin(false); return }
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
      setIsAdmin(data?.role === 'admin')
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      checkRole(session?.user?.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
      checkRole(session?.user?.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const close = () => {
    setIsOpen(false)
    setShopOpen(false)
    setOpenSubs({})
  }

  const toggleSub = (label: string) => {
    setOpenSubs((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const menu = isOpen ? (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={close} />
      <div className="absolute inset-0 bg-white animate-slide-in-left flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 shrink-0">
          <Image src="/images/itero7-logo.png" alt="ITERO7" height={32} width={100} className="h-8 w-auto object-contain" />
          <button onClick={close} className="p-1" aria-label="메뉴 닫기">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 콘텐츠 */}
        <nav className="flex-1 overflow-y-auto px-6 pt-8 pb-8">
          {/* 계정 */}
          {isAdmin && (
            <div className="mb-4">
              <Link href="/admin" onClick={close} className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.15em] text-purple-600 hover:text-purple-800 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.06 12a11.955 11.955 0 013.538 6 11.959 11.959 0 0110.402 1.964 11.959 11.959 0 0110.402-1.964 11.955 11.955 0 013.538-6A11.955 11.955 0 0020.402 6 11.959 11.959 0 019 5.036z" />
                </svg>
                ADMIN
              </Link>
            </div>
          )}
                    <div className="flex items-center gap-5 mb-10">
            {isLoggedIn ? (
              <Link href="/account" onClick={close} className="text-xs font-semibold tracking-[0.15em] text-gray-500 hover:text-black transition-colors">MY PAGE</Link>
            ) : (
              <Link href="/auth/login" onClick={close} className="text-xs font-semibold tracking-[0.15em] text-gray-500 hover:text-black transition-colors">LOGIN</Link>
            )}
            <span className="text-gray-200">|</span>
            <Link href="/account" onClick={close} className="text-xs font-semibold tracking-[0.15em] text-gray-500 hover:text-black transition-colors">MY ACCOUNT</Link>
          </div>

          {/* 메인 메뉴 */}
          <div className="space-y-1 mb-10">

            {/* SHOP 아코디언 */}
            <div>
              <button
                onClick={() => setShopOpen((v) => !v)}
                className="flex items-center justify-between w-full text-[24px] font-black tracking-tight py-2"
              >
                SHOP
                <ChevronIcon open={shopOpen} />
              </button>

              {shopOpen && (
                <div className="mt-2 mb-3 pl-1 border-l-2 border-gray-100 space-y-1">
                  {SHOP_NAV.map((item) => (
                    <div key={item.label}>
                      {item.children ? (
                        <>
                          <button
                            onClick={() => toggleSub(item.label)}
                            className="flex items-center justify-between w-full py-2 pr-2 text-sm font-semibold tracking-[0.1em] text-gray-700 hover:text-black transition-colors"
                          >
                            {item.label}
                            <ChevronIcon open={!!openSubs[item.label]} />
                          </button>
                          {openSubs[item.label] && (
                            <div className="pl-4 space-y-2 pb-2">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={close}
                                  className="block text-xs tracking-[0.1em] text-gray-400 hover:text-black transition-colors py-1"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={close}
                          className="block py-2 text-sm font-semibold tracking-[0.1em] text-gray-700 hover:text-black transition-colors"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/new-arrivals" onClick={close} className="block text-[24px] font-black tracking-tight py-2">NEW ARRIVALS</Link>

            <div>
              <p className="text-[24px] font-black tracking-tight py-2">COMMUNITY</p>
              <div className="space-y-3 pl-1 border-l border-gray-100 mb-2">
                <Link href="/community/review" onClick={close} className="block text-sm text-gray-500 hover:text-black transition-colors">REVIEW</Link>
                <Link href="/community/lookbook" onClick={close} className="block text-sm text-gray-500 hover:text-black transition-colors">LOOK BOOK</Link>
                <Link href="/community/qna" onClick={close} className="block text-sm text-gray-500 hover:text-black transition-colors">Q&amp;A</Link>
                <Link href="/community/event" onClick={close} className="block text-sm text-gray-500 hover:text-black transition-colors">EVENT</Link>
              </div>
            </div>
          </div>

          {/* 하단 링크 */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <Link href="/account/orders" onClick={close} className="block text-sm text-gray-500 hover:text-black transition-colors">주문조회</Link>
            <Link href="/cart" onClick={close} className="block text-sm text-gray-500 hover:text-black transition-colors">장바구니</Link>
          </div>
        </nav>

        {/* 하단 바 */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex items-center gap-4 text-[10px] text-gray-400">
          <Link href="/terms" onClick={close}>이용약관</Link>
          <Link href="/privacy" onClick={close}>개인정보처리방침</Link>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button onClick={() => { setIsOpen(true); setShopOpen(true) }} className="lg:hidden p-1" aria-label="메뉴 열기">
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      {/* createPortal로 body에 직접 렌더링 - header의 backdrop-blur가 fixed 위치를 깨뜨리는 문제 해결 */}
      {mounted && menu && createPortal(menu, document.body)}
    </>
  )
}

export function SearchButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const searchPanel = isOpen ? (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-100 animate-slide-down">
        <div className="px-6 h-16 flex items-center">
          <form onSubmit={handleSearch} className="flex items-center gap-3 w-full">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="상품 검색..." autoFocus className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent" />
            <button type="button" onClick={() => { setIsOpen(false); setQuery('') }} className="text-xs text-gray-400 hover:text-black transition-colors shrink-0">취소</button>
          </form>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-1" aria-label="검색">
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>
      {/* createPortal로 body에 직접 렌더링 */}
      {mounted && searchPanel && createPortal(searchPanel, document.body)}
    </>
  )
}
