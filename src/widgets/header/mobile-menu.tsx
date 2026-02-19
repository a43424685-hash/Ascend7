'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const menu = isOpen ? (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={() => setIsOpen(false)} />
      <div className="absolute inset-0 bg-white animate-slide-in-left flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 shrink-0">
          <span className="text-sm font-black tracking-[0.2em]">ASCEND7</span>
          <button onClick={() => setIsOpen(false)} className="p-1" aria-label="메뉴 닫기">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 콘텐츠 */}
        <nav className="flex-1 overflow-y-auto px-6 pt-8 pb-8">
          {/* 계정 */}
          <div className="flex items-center gap-5 mb-10">
            <Link href="/auth/login" onClick={() => setIsOpen(false)} className="text-xs font-semibold tracking-[0.15em] text-gray-500 hover:text-black transition-colors">LOGIN</Link>
            <span className="text-gray-200">|</span>
            <Link href="/account" onClick={() => setIsOpen(false)} className="text-xs font-semibold tracking-[0.15em] text-gray-500 hover:text-black transition-colors">MY ACCOUNT</Link>
          </div>

          {/* 메인 메뉴 */}
          <div className="space-y-5 mb-10">
            <Link href="/shop" onClick={() => setIsOpen(false)} className="block text-[24px] font-black tracking-tight">SHOP</Link>
            <Link href="/new-arrivals" onClick={() => setIsOpen(false)} className="block text-[24px] font-black tracking-tight">NEW ARRIVALS</Link>
            <div>
              <p className="text-[24px] font-black tracking-tight mb-4">COMMUNITY</p>
              <div className="space-y-3 pl-1 border-l border-gray-100">
                <Link href="/community/review" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">REVIEW</Link>
                <Link href="/community/lookbook" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">LOOK BOOK</Link>
                <Link href="/community/qna" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">Q&amp;A</Link>
                <Link href="/community/event" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">EVENT</Link>
              </div>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="border-t border-gray-100 pt-6 mb-6">
            <p className="text-[9px] tracking-[0.3em] text-gray-400 uppercase mb-4 font-medium">Categories</p>
            <div className="space-y-3">
              <Link href="/shop" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">All Products</Link>
              <Link href="/shop?category=top" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">Tops</Link>
              <Link href="/shop?category=bottom" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">Bottoms</Link>
              <Link href="/shop?category=accessories" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">Accessories</Link>
            </div>
          </div>

          {/* 하단 링크 */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <Link href="/account/orders" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">주문조회</Link>
            <Link href="/cart" onClick={() => setIsOpen(false)} className="block text-sm text-gray-500 hover:text-black transition-colors">장바구니</Link>
          </div>
        </nav>

        {/* 하단 바 */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex items-center gap-4 text-[10px] text-gray-400">
          <Link href="/terms" onClick={() => setIsOpen(false)}>이용약관</Link>
          <Link href="/privacy" onClick={() => setIsOpen(false)}>개인정보처리방침</Link>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="lg:hidden p-1" aria-label="메뉴 열기">
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
