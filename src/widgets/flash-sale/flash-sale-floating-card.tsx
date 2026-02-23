'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/shared/lib/utils'
import type { FlashSaleWithProduct } from '@/entities/flash-sale/api/get-flash-sales'

interface FlashSaleFloatingCardProps {
  sales: FlashSaleWithProduct[]
}

export function FlashSaleFloatingCard({ sales }: FlashSaleFloatingCardProps) {
  const [sale, setSale] = useState(sales[0] ?? null)
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })
  const [expired, setExpired] = useState(false)

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

  if (!sale || expired) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  const href = sale.product ? `/product/${sale.product.slug}` : '#'

  return (
    <div className="absolute bottom-16 left-4 z-20 w-44 bg-black/90 backdrop-blur-sm text-white shadow-2xl">
      {/* 헤더 */}
      <div className="bg-red-600 px-3 py-1.5 flex items-center gap-1.5">
        <span className="text-sm">⚡</span>
        <span className="text-[10px] font-black tracking-[0.2em] uppercase">Flash Sale</span>
      </div>

      {/* 카운트다운 */}
      <div className="px-3 py-2 border-b border-white/10">
        <p className="text-[9px] text-white/40 mb-1 tracking-wider">종료까지</p>
        <p className="text-xl font-black tabular-nums tracking-tight text-red-400">
          {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
        </p>
      </div>

      {/* 상품 정보 */}
      <div className="px-3 py-2.5">
        {sale.variant && (
          <p className="text-[9px] text-white/40 mb-0.5">
            {sale.variant.color} / {sale.variant.size}
          </p>
        )}
        <p className="text-xs font-medium line-clamp-2 leading-snug mb-2">
          {sale.product?.name || sale.title}
        </p>
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm font-black text-yellow-400">{formatPrice(sale.sale_price)}</span>
          <span className="text-[10px] text-white/30 line-through">{formatPrice(sale.original_price)}</span>
          <span className="ml-auto text-[10px] font-bold text-yellow-400">-{sale.discount_percent}%</span>
        </div>
        <Link
          href={href}
          className="block w-full bg-red-600 hover:bg-red-500 text-center text-[10px] font-bold tracking-wider py-1.5 transition-colors"
        >
          지금 구매 →
        </Link>
      </div>
    </div>
  )
}
