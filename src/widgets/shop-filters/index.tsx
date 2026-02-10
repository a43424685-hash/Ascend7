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
    { value: 'accessories', label: 'ACCESSORIES' },
  ]

  const colors = [
    { value: 'all', label: 'ALL COLORS' },
    { value: 'Black', label: 'Black' },
    { value: 'Gray', label: 'Gray' },
    { value: 'Navy', label: 'Navy' },
    { value: 'Red', label: 'Red' },
  ]

  const sizes = [
    { value: 'all', label: 'ALL SIZES' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'One Size', label: 'One Size' },
  ]

  const sortOptions = [
    { value: 'newest', label: '신상품' },
    { value: 'price-asc', label: '가격 낮은순' },
    { value: 'price-desc', label: '가격 높은순' },
  ]

  return (
    <div className="space-y-4">
      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-semibold mb-2">CATEGORY</label>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateFilter('category', cat.value)}
              className={`px-4 py-2 border-2 text-sm font-medium transition-colors ${
                (!currentFilters.category && cat.value === 'all') ||
                currentFilters.category === cat.value
                  ? 'border-black bg-black text-white'
                  : 'border-black bg-white text-black hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 색상 & 사이즈 & 정렬 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 색상 */}
        <div>
          <label className="block text-sm font-semibold mb-2">COLOR</label>
          <select
            value={currentFilters.color || 'all'}
            onChange={(e) => updateFilter('color', e.target.value)}
            className="w-full px-4 py-2 border-2 border-black text-sm font-medium"
          >
            {colors.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>

        {/* 사이즈 */}
        <div>
          <label className="block text-sm font-semibold mb-2">SIZE</label>
          <select
            value={currentFilters.size || 'all'}
            onChange={(e) => updateFilter('size', e.target.value)}
            className="w-full px-4 py-2 border-2 border-black text-sm font-medium"
          >
            {sizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* 정렬 */}
        <div>
          <label className="block text-sm font-semibold mb-2">SORT</label>
          <select
            value={currentFilters.sortBy || 'newest'}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="w-full px-4 py-2 border-2 border-black text-sm font-medium"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {(currentFilters.category ||
        currentFilters.color ||
        currentFilters.size ||
        currentFilters.sortBy !== 'newest') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">활성 필터:</span>
          {currentFilters.category && (
            <span className="px-3 py-1 bg-black text-white text-xs font-medium">
              {categories.find((c) => c.value === currentFilters.category)?.label}
              <button
                onClick={() => updateFilter('category', null)}
                className="ml-2 hover:underline"
              >
                ×
              </button>
            </span>
          )}
          {currentFilters.color && (
            <span className="px-3 py-1 bg-black text-white text-xs font-medium">
              {currentFilters.color}
              <button
                onClick={() => updateFilter('color', null)}
                className="ml-2 hover:underline"
              >
                ×
              </button>
            </span>
          )}
          {currentFilters.size && (
            <span className="px-3 py-1 bg-black text-white text-xs font-medium">
              {currentFilters.size}
              <button
                onClick={() => updateFilter('size', null)}
                className="ml-2 hover:underline"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => router.push('/shop')}
            className="text-xs text-gray-600 hover:underline"
          >
            모든 필터 초기화
          </button>
        </div>
      )}
    </div>
  )
}

