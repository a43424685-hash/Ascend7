'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CountdownTimer } from './countdown-timer'
import { formatPrice } from '@/shared/lib/utils'
import type { FlashSaleWithProduct } from '@/entities/flash-sale/api/get-flash-sales'

interface FlashSaleSectionProps {
  sales: FlashSaleWithProduct[]
}

export function FlashSaleSection({ sales }: FlashSaleSectionProps) {
  const [expired, setExpired] = useState<Set<string>>(new Set())

  const activeSales = sales.filter((s) => !expired.has(s.id))

  if (activeSales.length === 0) return null

  const mainSale = activeSales[0]
  const stockLeft = mainSale.max_quantity !== null
    ? mainSale.max_quantity - mainSale.sold_quantity
    : null
  const stockPercent = mainSale.max_quantity !== null
    ? Math.max(0, Math.min(100, ((mainSale.max_quantity - mainSale.sold_quantity) / mainSale.max_quantity) * 100))
    : 100

  return (
    <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white">
      <div className="container mx-auto px-6 lg:px-10 py-10 lg:py-16">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-[9px] tracking-[0.35em] text-white/50 uppercase">Limited Time</p>
              <h2 className="text-xl lg:text-2xl font-black tracking-tight">FLASH SALE</h2>
            </div>
          </div>
          <CountdownTimer
            endAt={mainSale.end_at}
            onExpired={() => setExpired((prev) => new Set([...prev, mainSale.id]))}
          />
        </div>

        {/* 상품 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeSales.map((sale) => {
            const imageUrl = sale.product?.images?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url
            const saleStockLeft = sale.max_quantity !== null ? sale.max_quantity - sale.sold_quantity : null
            const saleStockPercent = sale.max_quantity !== null
              ? Math.max(0, Math.min(100, ((sale.max_quantity - sale.sold_quantity) / sale.max_quantity) * 100))
              : 100

            return (
              <Link
                key={sale.id}
                href={sale.product ? `/product/${sale.product.slug}` : '#'}
                className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 rounded-sm overflow-hidden"
              >
                {/* 이미지 */}
                <div className="aspect-[3/4] relative overflow-hidden bg-white/5">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={sale.product?.name || sale.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/20 text-xs">No Image</span>
                    </div>
                  )}
                  {/* 할인율 배지 */}
                  <div className="absolute top-2.5 left-2.5 bg-yellow-400 text-black text-xs font-black px-2 py-0.5">
                    -{sale.discount_percent}%
                  </div>
                  {/* 남은 수량 배지 */}
                  {saleStockLeft !== null && saleStockLeft <= 10 && (
                    <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5">
                      {saleStockLeft === 0 ? '품절' : `${saleStockLeft}개 남음`}
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="p-3">
                  {sale.variant && (
                    <p className="text-[9px] text-white/50 mb-1">{sale.variant.color} / {sale.variant.size}</p>
                  )}
                  <h3 className="text-sm font-semibold line-clamp-1 mb-2">
                    {sale.product?.name || sale.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-black">{formatPrice(sale.sale_price)}</span>
                    <span className="text-xs text-white/40 line-through">{formatPrice(sale.original_price)}</span>
                  </div>

                  {/* 재고 바 */}
                  {sale.max_quantity !== null && (
                    <div>
                      <div className="flex justify-between text-[10px] text-white/50 mb-1">
                        <span>판매현황</span>
                        <span>{saleStockLeft === 0 ? '품절' : `${saleStockLeft}개 남음`}</span>
                      </div>
                      <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            saleStockPercent < 20 ? 'bg-yellow-400' : 'bg-white'
                          }`}
                          style={{ width: `${100 - saleStockPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
