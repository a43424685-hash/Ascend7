import { Suspense } from 'react'
import { getProductsWithFilters } from '@/entities/product/api/get-products-with-filters'
import { ProductGrid } from '@/widgets/product-grid'
import { ShopFilters } from '@/widgets/shop-filters'

export default async function ShopPage({
  searchParams,
}: {
  searchParams: {
    category?: string
    color?: string
    size?: string
    sort?: 'newest' | 'price-asc' | 'price-desc'
    q?: string
  }
}) {
  const filters = {
    category: searchParams.category,
    color: searchParams.color,
    size: searchParams.size,
    sortBy: searchParams.sort || 'newest',
    q: searchParams.q,
  }

  const products = await getProductsWithFilters(filters)

  return (
    <div className="container mx-auto px-4 py-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-baseline justify-between mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            {searchParams.q ? `"${searchParams.q}" 검색 결과` : 'SHOP'}
          </h1>
          <span className="text-xs text-gray-400">{products.length}개</span>
        </div>
        <Suspense fallback={<div className="h-10" />}>
          <ShopFilters currentFilters={filters} />
        </Suspense>
      </div>
      <ProductGrid products={products} />
    </div>
  )
}
