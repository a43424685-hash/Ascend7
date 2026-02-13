'use client'

import { useState } from 'react'
import Link from 'next/link'

const THEME_STYLES = {
  dark: 'bg-black text-white',
  light: 'bg-white text-black border-b border-gray-200',
  brand: 'bg-gray-900 text-white',
  accent: 'bg-red-600 text-white',
} as const

interface AnnouncementBarProps {
  text: string
  linkUrl?: string | null
  theme: keyof typeof THEME_STYLES
}

export function AnnouncementBar({ text, linkUrl, theme }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !text) return null

  const style = THEME_STYLES[theme] || THEME_STYLES.dark

  const content = (
    <span className="text-[11px] sm:text-xs tracking-wider">
      {text}
      {linkUrl && <span className="ml-1 underline">→</span>}
    </span>
  )

  return (
    <div className={`${style} relative`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-2 sm:py-2.5">
          {linkUrl ? (
            <Link href={linkUrl} className="hover:opacity-80 transition-opacity">
              {content}
            </Link>
          ) : (
            content
          )}
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="공지 닫기"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
