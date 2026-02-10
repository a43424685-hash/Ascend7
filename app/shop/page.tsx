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
  }
}) {
  const filters = {
    category: searchParams.category,
    color: searchParams.color,
    size: searchParams.size,
    sortBy: searchParams.sort || 'newest',
  }

  const products = await getProductsWithFilters(filters)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">SHOP</h1>
        <Suspense fallback={<div className="h-32">필터 로딩 중...</div>}>
          <ShopFilters currentFilters={filters} />
        </Suspense>
      </div>
      <div className="mb-4 text-sm text-gray-600">
        {products.length > 0 ? (
          <span>{products.length}개의 제품</span>
        ) : (
          <span>제품을 찾을 수 없습니다</span>
        )}
      </div>
      <ProductGrid products={products} />
    </div>
  )
}
