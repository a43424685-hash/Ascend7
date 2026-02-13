'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ProductFilters } from '@/entities/product/api/get-products-with-filters'

interface ShopFiltersProps {
  currentFilters: ProductFilters
}

export function ShopFilters({ currentFilters }: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/shop?${params.toString()}`)
  }

  const categories = [
    { value: 'all', label: 'ALL' },
    { value: 'top', label: 'TOPS' },
    { value: 'bottom', label: 'BOTTOMS' },
    { value: 'accessories', label: 'ACC' },
  ]

  const sortOptions = [
    { value: 'newest', label: '신상품' },
    { value: 'price-asc', label: '가격 낮은순' },
    { value: 'price-desc', label: '가격 높은순' },
  ]

  return (
    <div className="space-y-4">
      {/* 카테고리 탭 + 정렬 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateFilter('category', cat.value)}
              className={`px-3 sm:px-5 py-2 text-xs font-semibold tracking-wider whitespace-nowrap transition-all ${
                (!currentFilters.category && cat.value === 'all') ||
                currentFilters.category === cat.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <select
          value={currentFilters.sortBy || 'newest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-2 bg-white shrink-0"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 활성 필터 표시 */}
      {(currentFilters.category || currentFilters.q) && (
        <div className="flex items-center gap-2 flex-wrap">
          {currentFilters.category && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-xs font-medium rounded">
              {categories.find((c) => c.value === currentFilters.category)?.label}
              <button
                onClick={() => updateFilter('category', null)}
                className="text-gray-400 hover:text-black"
              >
                ×
              </button>
            </span>
          )}
          {currentFilters.q && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-xs font-medium rounded">
              &ldquo;{currentFilters.q}&rdquo;
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('q')
                  router.push(`/shop?${params.toString()}`)
                }}
                className="text-gray-400 hover:text-black"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => router.push('/shop')}
            className="text-[11px] text-gray-400 hover:text-black transition-colors"
          >
            초기화
          </button>
        </div>
      )}
    </div>
  )
}
