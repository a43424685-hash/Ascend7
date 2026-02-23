'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/shared/lib/utils'
import type { FlashSaleWithProduct } from '@/entities/flash-sale/api/get-flash-sales'

interface FlashSaleFloatingCardProps {
  sales: FlashSaleWithProduct[]
}

export function FlashSaleFloatingCard({ sales }: FlashSaleFloatingCardProps) {
  const [sale] = useState(sales[0] ?? null)
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })
  const [expired, setExpired] = useState(false)
  const [colonVisible, setColonVisible] = useState(true)

  useEffect(() => {
    if (!sale) return
    const calc = () => {
      const diff = new Date(sale.end_at).getTime() - Date.now()
      if (diff <= 0) {
        setExpired(true)
        return
      }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [sale])

  // 콜론 깜빡임
  useEffect(() => {
    const id = setInterval(() => setColonVisible(v => !v), 500)
    return () => clearInterval(id)
  }, [])

  if (!sale || expired) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  const href = sale.product ? `/product/${sale.product.slug}` : '#'
  const colon = <span style={{ opacity: colonVisible ? 1 : 0, transition: 'opacity 0.1s' }}>:</span>

  return (
    <div
      className="fixed bottom-4 left-4 z-50 w-[168px] text-white overflow-hidden"
      style={{
        background: '#111111',
        border: '1px solid #333333',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* TIMEDEAL 뱃지 */}
      <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
        <span
          className="text-[9px] font-semibold tracking-[0.25em] uppercase"
          style={{
            color: '#ffffff',
            border: '1px solid #444',
            padding: '2px 6px',
            borderRadius: '3px',
          }}
        >
          TIMEDEAL
        </span>
        {sale.discount_percent > 0 && (
          <span
            className="text-[10px] font-bold"
            style={{
              color: '#ffffff',
              border: '1px solid #555',
              padding: '2px 5px',
              borderRadius: '3px',
            }}
          >
            -{sale.discount_percent}%
          </span>
        )}
      </div>

      {/* 타이머 */}
      <div className="px-3.5 pb-2.5" style={{ borderBottom: '1px solid #222' }}>
        <p className="text-[10px] mb-1" style={{ color: '#888888', letterSpacing: '0.05em' }}>
          종료까지
        </p>
        <p
          className="tabular-nums leading-none"
          style={{ fontSize: '26px', fontWeight: 300, letterSpacing: '-0.02em', color: '#ffffff' }}
        >
          {pad(timeLeft.h)}{colon}{pad(timeLeft.m)}{colon}{pad(timeLeft.s)}
        </p>
      </div>

      {/* 상품 정보 */}
      <div className="px-3.5 py-2.5">
        {sale.variant && (
          <p className="text-[9px] mb-1" style={{ color: '#555555' }}>
            {sale.variant.color} / {sale.variant.size}
          </p>
        )}
        <p
          className="line-clamp-1 mb-2"
          style={{ fontSize: '11px', color: '#aaaaaa', fontWeight: 400, lineHeight: '1.4' }}
        >
          {sale.product?.name || sale.title}
        </p>
        <div className="flex items-baseline gap-2 mb-3">
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
            {formatPrice(sale.sale_price)}
          </span>
          <span
            className="line-through"
            style={{ fontSize: '11px', color: '#555555' }}
          >
            {formatPrice(sale.original_price)}
          </span>
        </div>

        {/* 버튼 */}
        <Link
          href={href}
          className="block w-full text-center transition-all duration-200"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            padding: '7px 0',
            border: '1px solid #ffffff',
            color: '#ffffff',
            background: 'transparent',
            borderRadius: '4px',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#ffffff'
            ;(e.currentTarget as HTMLElement).style.color = '#111111'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = '#ffffff'
          }}
        >
          지금 구매 →
        </Link>
      </div>
    </div>
  )
}
