'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const DISMISS_KEY = 'ascend7_ann_v1'

export const DEFAULT_SLIDES = [
  { id: 'd1', text_ko: '🎁 신규 회원가입 시 3,000P 즉시 지급', link_url: '/auth/login' },
  { id: 'd2', text_ko: '🚚 5만원 이상 구매 시 무료배송', link_url: '/shop' },
  { id: 'd3', text_ko: '⭐ 포토리뷰 2,000P · 텍스트리뷰 1,000P 적립', link_url: '/community/review' },
  { id: 'd4', text_ko: '💬 카카오 채널 추가하고 재입고 알림 받기', link_url: null },
]

interface Slide {
  id: string
  text_ko: string
  link_url: string | null
}

interface SlidingAnnouncementBarProps {
  slides?: Slide[]
}

export function SlidingAnnouncementBar({ slides }: SlidingAnnouncementBarProps) {
  const items = slides && slides.length > 0 ? slides : DEFAULT_SLIDES
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) setDismissed(true)
    } catch {}
  }, [])

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % items.length)
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(next, 3000)
    return () => clearInterval(timer)
  }, [next, items.length])

  const handleDismiss = () => {
    setDismissed(true)
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  if (!mounted || dismissed) return null

  const slide = items[current]
  const activeDot = 'w-1 h-1 rounded-full bg-white'
  const inactiveDot = 'w-1 h-1 rounded-full bg-white/25'

  const textEl = (
    <span className="text-[11px] sm:text-xs font-medium tracking-wider select-none">
      {slide.text_ko}
    </span>
  )

  return (
    <div
      className="relative overflow-hidden flex items-center shrink-0"
      style={{ backgroundColor: '#1e2d3d', height: '36px' }}
    >
      <div className="w-full flex items-center justify-center px-10">
        {slide.link_url ? (
          <Link href={slide.link_url} className="text-white hover:text-white/80 transition-colors">
            {textEl}
          </Link>
        ) : (
          <span className="text-white">{textEl}</span>
        )}
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={i === current ? activeDot : inactiveDot}
            />
          ))}
        </div>
      )}

      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
        aria-label="닫기"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export { SlidingAnnouncementBar as AnnouncementBar }
