'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* 햄버거 버튼 - 모바일에서만 표시 */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-1"
        aria-label="메뉴 열기"
      >
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* 풀스크린 메뉴 */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-white animate-fade-in">
          {/* 메뉴 헤더 */}
          <div className="flex items-center justify-end px-4 h-14">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1"
              aria-label="메뉴 닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 메뉴 콘텐츠 */}
          <nav className="px-6 pt-2 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
            {/* 상단 링크 */}
            <div className="flex items-center gap-4 mb-8">
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold tracking-wider"
              >
                LOGIN ↗
              </Link>
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold tracking-wider"
              >
                MY
              </Link>
            </div>

            {/* 메인 카테고리 */}
            <div className="space-y-5 mb-10">
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="block text-2xl font-black tracking-tight"
              >
                ALL
              </Link>
              <Link
                href="/shop?sort=newest"
                onClick={() => setIsOpen(false)}
                className="block text-2xl font-black tracking-tight"
              >
                NEW
              </Link>
            </div>

            {/* SHOP 섹션 */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <p className="text-lg font-black tracking-tight mb-4">SHOP</p>
              <div className="space-y-3 pl-1">
                <Link
                  href="/shop?category=top"
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-gray-600 font-medium tracking-wider"
                >
                  TOP
                </Link>
                <Link
                  href="/shop?category=bottom"
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-gray-600 font-medium tracking-wider"
                >
                  BOTTOM
                </Link>
                <Link
                  href="/shop?category=accessories"
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-gray-600 font-medium tracking-wider"
                >
                  ACC
                </Link>
              </div>
            </div>

            {/* 하단 링크 */}
            <div className="border-t border-gray-200 pt-6 space-y-5">
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="block text-lg font-black tracking-tight"
              >
                MY ACCOUNT
              </Link>
              <Link
                href="/account/orders"
                onClick={() => setIsOpen(false)}
                className="block text-lg font-black tracking-tight"
              >
                주문조회
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

export function SearchButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1"
        aria-label="검색"
      >
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 animate-slide-down">
            <div className="px-4 h-14 flex items-center">
              <form onSubmit={handleSearch} className="flex items-center gap-3 w-full">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="상품 검색..."
                  autoFocus
                  className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); setQuery('') }}
                  className="text-xs text-gray-500 hover:text-black shrink-0"
                >
                  취소
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
