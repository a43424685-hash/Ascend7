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
}

interface RecentlyViewedSectionProps {
  current: RecentlyViewedItem
}

const KEY = 'ascend7_recently_viewed'
const MAX = 8

function getStored(): RecentlyViewedItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function RecentlyViewedSection({ current }: RecentlyViewedSectionProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    const stored = getStored()
    const filtered = stored.filter((i) => i.slug !== current.slug)
    const next = [current, ...filtered].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
    setItems(filtered.slice(0, 4))
  }, [current.slug])

  if (items.length === 0) return null

  return (
    <div className="container mx-auto px-4 mt-16 lg:mt-24">
      <h2 className="text-xl lg:text-2xl font-bold mb-8">최근 본 상품</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {items.map((item) => (
          <Link key={item.slug} href={`/product/${item.slug}`} className="group">
            <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden mb-3">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>
            <h3 className="text-sm font-semibold mb-1 truncate">{item.name}</h3>
            <p className="text-sm text-gray-600">
              {item.price > 0 ? formatPrice(item.price) : '가격 문의'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
