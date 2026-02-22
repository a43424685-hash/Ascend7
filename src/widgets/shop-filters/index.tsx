'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { ProductFilters } from '@/entities/product/api/get-products-with-filters'

interface ShopFiltersProps {
  currentFilters: ProductFilters
  totalCount?: number
}

type SubItem = { value: string; label: string }
type CategoryItem = {
  value: string
  label: string
  subs: SubItem[] | null
}

const CATEGORIES: CategoryItem[] = [
  { value: 'all', label: 'ALL', subs: null },
  { value: 'outer', label: 'OUTER', subs: null },
  {
    value: 'top',
    label: 'TOP',
    subs: [
      { value: 'all', label: 'ALL' },
      { value: 'hoodie', label: 'HOODIE' },
      { value: 'sweater', label: 'SWEATER' },
      { value: 'tshirts', label: 'T-SHIRTS' },
      { value: 'longsleeve', label: 'LONG SLEEVE' },
      { value: 'sleeveless', label: 'SLEEVELESS' },
    ],
  },
  {
    value: 'bottom',
    label: 'BOTTOM',
    subs: [
      { value: 'all', label: 'ALL' },
      { value: 'shorts', label: 'SHORTS' },
      { value: 'pants', label: 'PANTS' },
    ],
  },
  {
    value: 'accessories',
    label: 'ACC',
    subs: [
      { value: 'all', label: 'ALL' },
      { value: 'cap', label: 'CAP' },
      { value: 'socks', label: 'SOCKS' },
      { value: 'bag', label: 'BAG' },
    ],
  },
]

const SORT_OPTIONS = [
  { value: 'newest', label: '신상품순' },
  { value: 'price-asc', label: '가격 낮은순' },
  { value: 'price-desc', label: '가격 높은순' },
]

export function ShopFilters({ currentFilters, totalCount }: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeCategory = currentFilters.category || 'all'
  const activeSub = currentFilters.sub || 'all'
  const activeSort = currentFilters.sortBy || 'newest'
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? '신상품순'

  const activeCategoryData = CATEGORIES.find((c) => c.value === activeCategory)
  const showSubFilter = !!(activeCategoryData?.subs && activeCategoryData.subs.length > 0)

  const setCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    params.delete('sub')
    router.push(`/shop?${params.toString()}`)
  }

  const setSub = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('sub')
    } else {
      params.set('sub', value)
    }
    router.push(`/shop?${params.toString()}`)
  }

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'newest') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    router.push(`/shop?${params.toString()}`)
    setSortOpen(false)
  }

  return (
    <div className="sticky top-16 z-[100] bg-white border-b border-gray-100">
      {/* 메인 카테고리 탭 */}
      <div className="container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`relative px-4 h-12 text-[11px] font-semibold tracking-[0.15em] whitespace-nowrap transition-colors ${
                    isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                  )}
                </button>
              )
            })}

            {/* 검색 필터 태그 */}
            {currentFilters.q && (
              <div className="ml-3 flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 text-[10px] text-gray-500">
                <span>&ldquo;{currentFilters.q}&rdquo;</span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('q')
                    router.push(`/shop?${params.toString()}`)
                  }}
                  className="text-gray-400 hover:text-black ml-0.5"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* 우측: 상품 수 + 정렬 */}
          <div className="flex items-center gap-4 shrink-0">
            {totalCount !== undefined && (
              <span className="hidden sm:block text-[10px] text-gray-300 tracking-wider tabular-nums">
                {totalCount}개
              </span>
            )}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-black transition-colors tracking-wider"
              >
                {activeSortLabel}
                <svg
                  className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-gray-100 shadow-sm z-10">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSort(option.value)}
                      className={`w-full px-4 py-3 text-left text-[11px] tracking-wider transition-colors ${
                        activeSort === option.value
                          ? 'text-black font-semibold'
                          : 'text-gray-400 hover:text-black'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 서브카테고리 탭 (TOP/BOTTOM/ACC 선택 시 표시) */}
      {showSubFilter && (
        <div className="border-t border-gray-50 bg-gray-50/60">
          <div className="container mx-auto px-6 lg:px-10">
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide h-9">
              {activeCategoryData!.subs!.map((sub) => {
                const isActive = activeSub === sub.value
                return (
                  <button
                    key={sub.value}
                    onClick={() => setSub(sub.value)}
                    className={`relative px-3 h-9 text-[10px] font-medium tracking-[0.12em] whitespace-nowrap transition-colors ${
                      isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {sub.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
