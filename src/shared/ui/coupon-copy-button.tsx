'use client'

import { useState } from 'react'

interface CouponCopyButtonProps {
  code: string
}

export function CouponCopyButton({ code }: CouponCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // 구형 브라우저 fallback
      const ta = document.createElement('textarea')
      ta.value = code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-3 bg-gray-50 border border-dashed border-gray-200 px-4 py-3 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer group"
    >
      <div className="text-left">
        <p className="text-[9px] text-gray-400 tracking-[0.2em] uppercase mb-0.5">할인 쿠폰</p>
        <p className="text-base font-mono font-bold tracking-[0.15em] text-black">{code}</p>
      </div>
      <div className="ml-2 text-xs font-medium shrink-0 min-w-[48px] text-right">
        {copied ? (
          <span className="text-green-600">복사됨! ✓</span>
        ) : (
          <span className="text-gray-400 group-hover:text-black transition-colors">복사</span>
        )}
      </div>
    </button>
  )
}
