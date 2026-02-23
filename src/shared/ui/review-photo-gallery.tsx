'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ReviewPhotoGalleryProps {
  urls: string[]
  maxVisible?: number
  thumbSize?: string // tailwind class e.g. 'w-14 h-14'
}

export function ReviewPhotoGallery({ urls, maxVisible = 4, thumbSize = 'w-14 h-14' }: ReviewPhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const touchStartX = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  const open = (i: number) => setLightboxIndex(i)
  const close = () => setLightboxIndex(null)

  const prev = () => setLightboxIndex(i => (i! - 1 + urls.length) % urls.length)
  const next = () => setLightboxIndex(i => (i! + 1) % urls.length)

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, urls.length])

  if (!urls || urls.length === 0) return null

  return (
    <>
      {/* 썸네일 그리드 */}
      <div className="flex gap-1.5 mt-2.5 flex-wrap">
        {urls.slice(0, maxVisible).map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => open(i)}
            className={`${thumbSize} shrink-0 overflow-hidden border border-gray-100 hover:opacity-80 transition-opacity focus:outline-none`}
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
        {urls.length > maxVisible && (
          <button
            type="button"
            onClick={() => open(maxVisible)}
            className={`${thumbSize} shrink-0 bg-gray-100 border border-gray-100 flex items-center justify-center text-[11px] text-gray-500 font-medium hover:bg-gray-200 transition-colors focus:outline-none`}
          >
            +{urls.length - maxVisible}
          </button>
        )}
      </div>

      {/* 라이트박스 */}
      {mounted && lightboxIndex !== null && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={close}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white text-2xl hover:bg-white/10 rounded-full transition-colors"
          >
            ×
          </button>

          {/* 카운터 */}
          {urls.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {urls.length}
            </div>
          )}

          {/* 이미지 영역 */}
          <div
            className="relative flex items-center justify-center"
            onClick={e => e.stopPropagation()}
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
            onTouchEnd={e => {
              const diff = touchStartX.current - e.changedTouches[0].clientX
              if (Math.abs(diff) > 50) { diff > 0 ? next() : prev() }
            }}
          >
            <img
              src={urls[lightboxIndex]}
              alt=""
              className="max-w-[90vw] max-h-[90vh] object-contain select-none"
              draggable={false}
            />
          </div>

          {/* 이전/다음 버튼 */}
          {urls.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white text-2xl bg-black/40 hover:bg-black/70 rounded-full transition-colors"
              >
                ‹
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white text-2xl bg-black/40 hover:bg-black/70 rounded-full transition-colors"
              >
                ›
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
