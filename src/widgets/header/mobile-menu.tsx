'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* 햄버거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-1"
        aria-label="메뉴 열기"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 오버레이 + 사이드 메뉴 */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998]">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* 메뉴 패널 */}
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <span className="text-lg font-bold tracking-tight">MENU</span>
              <button onClick={() => setIsOpen(false)} aria-label="메뉴 닫기">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 네비게이션 */}
            <nav className="flex-1 px-6 py-6 space-y-1">
              {[
                { href: '/shop', label: 'SHOP' },
                { href: '/shop?category=top', label: 'TOPS' },
                { href: '/shop?category=bottom', label: 'BOTTOMS' },
                { href: '/shop?category=accessories', label: 'ACCESSORIES' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-sm font-medium tracking-wider border-b border-gray-100 hover:text-gray-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4">
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-sm font-medium tracking-wider hover:text-gray-600 transition-colors"
                >
                  MY ACCOUNT
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-sm font-medium tracking-wider hover:text-gray-600 transition-colors"
                >
                  CART
                </Link>
              </div>
            </nav>
          </div>
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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9998]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-white shadow-lg animate-slide-down">
            <div className="container mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="상품 검색..."
                  autoFocus
                  className="flex-1 text-sm py-2 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-500 hover:text-black"
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
