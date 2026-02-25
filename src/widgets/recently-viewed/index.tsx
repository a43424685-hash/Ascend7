'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/shared/lib/utils'

export interface RecentlyViewedItem {
  slug: string
  name: string
  imageUrl: string | null
  price: number
  isComingSoon?: boolean
}

interface RecentlyViewedSectionProps {
  current: RecentlyViewedItem
  /** 서버에서 내려주는 최신 준비중 슬러그 목록 - localStorage 캐시 값을 덮어씀 */
  comingSoonSlugs?: string[]
}

const KEY = 'itero7_recently_viewed'
const MAX = 8

function getStored(): RecentlyViewedItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function RecentlyViewedSection({ current, comingSoonSlugs }: RecentlyViewedSectionProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    const stored = getStored()
    const filtered = stored.filter((i) => i.slug !== current.slug)
    const next = [current, ...filtered].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
    // 서버 최신 상태로 isComingSoon 덮어쓰기
    const resolved = filtered.slice(0, 4).map((item) =>
      comingSoonSlugs
        ? { ...item, isComingSoon: comingSoonSlugs.includes(item.slug) }
        : item
    )
    setItems(resolved)
  }, [current.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (items.length === 0) return null

  return (
    <div className="container mx-auto px-4 mt-16 lg:mt-24">
      <h2 className="text-xl lg:text-2xl font-bold mb-8">최근 본 상품</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {items.map((item) => {
          const imageArea = (
            <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden mb-3">
              <div className={item.isComingSoon ? 'absolute inset-0 blur-sm opacity-40' : 'absolute inset-0'}>
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className={`object-cover transition-transform duration-300 ${!item.isComingSoon ? 'group-hover:scale-105' : ''}`}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>
              {item.isComingSoon && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-[11px] font-bold tracking-[0.3em] text-white uppercase">Coming Soon</span>
                </div>
              )}
            </div>
          )
          const infoArea = (
            <>
              <h3 className="text-sm font-semibold mb-1 truncate">{item.name}</h3>
              <p className="text-sm text-gray-600">
                {item.isComingSoon ? (
                  <span className="text-orange-400 text-xs">준비중</span>
                ) : item.price > 0 ? (
                  formatPrice(item.price)
                ) : (
                  '가격 문의'
                )}
              </p>
            </>
          )
          if (item.isComingSoon) {
            return (
              <div key={item.slug} className="cursor-default select-none">
                {imageArea}
                {infoArea}
              </div>
            )
          }
          return (
            <Link key={item.slug} href={`/product/${item.slug}`} className="group">
              {imageArea}
              {infoArea}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
