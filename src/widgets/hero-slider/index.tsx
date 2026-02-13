'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { HeroBanner } from '@/entities/banner/api/get-banners'

interface HeroSliderProps {
  banners: HeroBanner[]
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const total = banners.length

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const next = useCallback(() => {
    goTo((current + 1) % total)
  }, [current, total, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + total) % total)
  }, [current, total, goTo])

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, total])

  if (total === 0) return null

  return (
    <div className="relative w-full h-[85vh] lg:h-[90vh] overflow-hidden bg-black">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <Image
            src={banner.image_url}
            alt={banner.title || ''}
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-10">
            {banner.title && (
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-3 sm:mb-4 drop-shadow-lg">
                {banner.title}
              </h2>
            )}
            {banner.subtitle && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-200 max-w-lg mx-auto mb-6 sm:mb-8 drop-shadow">
                {banner.subtitle}
              </p>
            )}
            {banner.link_url && banner.link_text && (
              <Link
                href={banner.link_url}
                className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-black text-xs sm:text-sm font-bold tracking-wider hover:bg-gray-100 transition-all duration-300"
              >
                {banner.link_text}
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="이전"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="다음"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`배너 ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
