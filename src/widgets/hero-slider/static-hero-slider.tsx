'use client'

import { useState, useEffect, useCallback } from 'react'
// import Image from 'next/image' // 실제 이미지 사용 시 활성화
import Link from 'next/link'

// 히어로 슬라이드 데이터
// imageSrc: 실제 이미지 경로로 교체 (예: '/images/hero/slide-1.jpg')
const SLIDES = [
  {
    id: 1,
    // imageSrc: '/images/hero/slide-1.jpg',
    eyebrow: 'Premium Gymwear · 2026',
    title: 'ASCEND7',
    body: '일주일 내내, 멈추지 않고 성장하다',
    cta: { label: 'SHOP NOW', href: '/shop' },
    ctaSecondary: { label: 'NEW ARRIVALS', href: '/shop?category=top' },
  },
  {
    id: 2,
    // imageSrc: '/images/hero/slide-2.jpg',
    eyebrow: 'SS 2026 Collection',
    title: 'NEW SEASON',
    body: '새 시즌, 더 강해진 퍼포먼스',
    cta: { label: 'EXPLORE', href: '/shop' },
    ctaSecondary: null,
  },
  {
    id: 3,
    // imageSrc: '/images/hero/slide-3.jpg',
    eyebrow: 'Training Series',
    title: 'TRAIN HARD',
    body: '강인함은 매일의 선택에서 시작된다',
    cta: { label: 'SHOP NOW', href: '/shop' },
    ctaSecondary: null,
  },
]

// 슬라이드별 배경 그라디언트 (이미지 없을 때 대체)
const GRADIENTS = [
  'radial-gradient(ellipse 80% 80% at 50% 60%, #1c1c1c 0%, #000000 65%)',
  'radial-gradient(ellipse 80% 80% at 30% 50%, #181818 0%, #000000 65%)',
  'radial-gradient(ellipse 80% 80% at 70% 40%, #161616 0%, #000000 65%)',
]

export function StaticHeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const total = SLIDES.length

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return
      setIsAnimating(true)
      setCurrent(index)
      setTimeout(() => setIsAnimating(false), 900)
    },
    [isAnimating]
  )

  const next = useCallback(() => {
    goTo((current + 1) % total)
  }, [current, total, goTo])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="relative w-full h-[90vh] min-h-[600px] overflow-hidden bg-black">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
        >
          {/* 배경 그라디언트 (이미지 없을 때 기본값) */}
          <div
            className="absolute inset-0"
            style={{ background: GRADIENTS[i] ?? GRADIENTS[0] }}
          />

          {/* 실제 이미지 사용 시 아래 주석 해제 + Image import 활성화
          {slide.imageSrc && (
            <Image
              src={slide.imageSrc}
              alt=""
              fill
              className="object-cover opacity-60"
              sizes="100vw"
              priority={i === 0}
            />
          )} */}

          {/* 하단 페이드아웃 */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black to-transparent" />

          {/* 콘텐츠 */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
            {/* 아이브로우 태그 */}
            <p className="text-[9px] sm:text-[10px] tracking-[0.5em] uppercase text-white/25 mb-10 font-medium select-none">
              {slide.eyebrow}
            </p>

            {/* 메인 헤드라인 */}
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.025em] leading-none mb-7 text-white">
              {slide.title}
            </h2>

            {/* 얇은 구분선 */}
            <div className="w-8 h-px bg-white/20 mb-7" />

            {/* 서브 텍스트 */}
            <p className="text-[13px] sm:text-sm text-white/30 tracking-wide max-w-xs leading-relaxed mb-10">
              {slide.body}
            </p>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
              <Link
                href={slide.cta.href}
                className="px-10 py-3.5 border border-white/15 text-[10px] font-semibold tracking-[0.3em] text-white/70 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                {slide.cta.label}
              </Link>
              {slide.ctaSecondary && (
                <Link
                  href={slide.ctaSecondary.href}
                  className="text-[10px] font-medium tracking-[0.25em] text-white/25 hover:text-white/60 transition-colors"
                >
                  {slide.ctaSecondary.label} →
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* 도트 인디케이터 */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-500 ${
              i === current
                ? 'w-7 h-[2px] bg-white/60 rounded-none'
                : 'w-[3px] h-[3px] bg-white/15 hover:bg-white/30 rounded-full'
            }`}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>

      {/* 슬라이드 카운터 */}
      <div className="absolute bottom-9 right-8 z-20 text-[9px] text-white/15 tracking-[0.2em] tabular-nums select-none">
        <span className="text-white/30">{String(current + 1).padStart(2, '0')}</span>
        <span className="mx-1.5 text-white/10">/</span>
        <span>{String(total).padStart(2, '0')}</span>
      </div>
    </div>
  )
}
