'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { HeroBanner } from '@/entities/banner/api/get-banners'
import type { TextStyle } from '@/entities/cms/types/home-sections'

interface HeroSliderProps {
  banners: HeroBanner[]
}

function toCSS(s?: TextStyle): React.CSSProperties {
  if (!s) return {}
  const css: React.CSSProperties = {}
  if (s.fontSize) css.fontSize = s.fontSize
  if (s.fontWeight) css.fontWeight = s.fontWeight
  if (s.color) css.color = s.color
  if (s.textAlign) css.textAlign = s.textAlign
  if (s.letterSpacing) css.letterSpacing = s.letterSpacing
  return css
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
      {banners.map((banner, i) => {
        const ts = banner.text_style || {}
        const pos = ts.contentPosition || { x: 50, y: 50 }
        const overlayOpacity = ts.overlayOpacity ?? 40
        const hasCustomPos = pos.x !== 50 || pos.y !== 50

        return (
          <div
            key={banner.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            {/* 데스크탑 이미지 */}
            <Image
              src={banner.image_url}
              alt={banner.title || ''}
              fill
              className={`object-cover ${banner.image_mobile_url ? 'hidden sm:block' : ''}`}
              sizes="100vw"
              priority={i === 0}
            />
            {/* 모바일 이미지 (있으면) */}
            {banner.image_mobile_url && (
              <Image
                src={banner.image_mobile_url}
                alt={banner.title || ''}
                fill
                className="object-cover sm:hidden"
                sizes="100vw"
                priority={i === 0}
              />
            )}
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
            />

            {/* Content - 커스텀 위치 또는 기본 중앙 */}
            <div
              className={`absolute z-10 px-4 text-white ${
                hasCustomPos
                  ? 'max-w-2xl'
                  : 'inset-0 flex flex-col items-center justify-center text-center'
              }`}
              style={hasCustomPos ? {
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                textAlign: (ts.titleStyle?.textAlign || 'center') as React.CSSProperties['textAlign'],
              } : undefined}
            >
              {banner.title && (
                <h2
                  className={`tracking-tight leading-tight mb-3 sm:mb-4 drop-shadow-lg ${
                    !ts.titleStyle?.fontSize ? 'text-3xl sm:text-5xl lg:text-7xl' : ''
                  } ${
                    !ts.titleStyle?.fontWeight ? 'font-black' : ''
                  }`}
                  style={toCSS(ts.titleStyle)}
                >
                  {banner.title}
                </h2>
              )}
              {banner.subtitle && (
                <p
                  className={`max-w-lg mb-6 sm:mb-8 drop-shadow ${
                    !ts.subtitleStyle?.fontSize ? 'text-sm sm:text-base lg:text-lg' : ''
                  } ${
                    !ts.subtitleStyle?.color ? 'text-gray-200' : ''
                  }`}
                  style={hasCustomPos ? { margin: '0 auto', ...toCSS(ts.subtitleStyle) } : toCSS(ts.subtitleStyle)}
                >
                  {banner.subtitle}
                </p>
              )}

              {/* CTA 버튼 */}
              {banner.cta_buttons && banner.cta_buttons.length > 0 ? (
                <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${!hasCustomPos ? '' : 'justify-center'}`}>
                  {banner.cta_buttons.map((cta, idx) => (
                    <Link
                      key={idx}
                      href={cta.url}
                      className={
                        cta.style === 'outline'
                          ? 'px-8 sm:px-10 py-3 sm:py-4 border border-white text-white text-xs sm:text-sm font-bold tracking-wider hover:bg-white hover:text-black transition-all duration-300'
                          : 'px-8 sm:px-10 py-3 sm:py-4 bg-white text-black text-xs sm:text-sm font-bold tracking-wider hover:bg-gray-100 transition-all duration-300'
                      }
                    >
                      {cta.text}
                    </Link>
                  ))}
                </div>
              ) : banner.link_url && banner.link_text ? (
                <Link
                  href={banner.link_url}
                  className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-black text-xs sm:text-sm font-bold tracking-wider hover:bg-gray-100 transition-all duration-300"
                >
                  {banner.link_text}
                </Link>
              ) : null}
            </div>
          </div>
        )
      })}

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
