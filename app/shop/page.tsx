import { Suspense } from 'react'
import { getProductsWithFilters } from '@/entities/product/api/get-products-with-filters'
import { ProductGrid } from '@/widgets/product-grid'
import { ShopFilters } from '@/widgets/shop-filters'

const CATEGORY_LABELS: Record<string, string> = {
  outer: 'OUTER',
  top: 'TOPS',
  bottom: 'BOTTOMS',
  accessories: 'ACC',
}

const SUB_LABELS: Record<string, string> = {
  hoodie: 'HOODIE',
  sweater: 'SWEATER',
  tshirts: 'T-SHIRTS',
  longsleeve: 'LONG SLEEVE',
  sleeveless: 'SLEEVELESS',
  shorts: 'SHORTS',
  pants: 'PANTS',
  cap: 'CAP',
  socks: 'SOCKS',
  bag: 'BAG',
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: {
    category?: string
    sub?: string
    color?: string
    size?: string
    sort?: 'newest' | 'price-asc' | 'price-desc'
    q?: string
    minPrice?: string
    maxPrice?: string
  }
}) {
  const filters = {
    category: searchParams.category,
    sub: searchParams.sub,
    color: searchParams.color,
    size: searchParams.size,
    sortBy: searchParams.sort || 'newest',
    q: searchParams.q,
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
  }

  const products = await getProductsWithFilters(filters)

  const categoryLabel = searchParams.category
    ? (CATEGORY_LABELS[searchParams.category] ?? searchParams.category.toUpperCase())
    : null
  const subLabel = searchParams.sub
    ? (SUB_LABELS[searchParams.sub] ?? searchParams.sub.toUpperCase())
    : null

  return (
    <div className="min-h-screen">
      {/* 필터 바 - sticky */}
      <Suspense fallback={<div className="h-12 border-b border-gray-100" />}>
        <ShopFilters currentFilters={filters} totalCount={products.length} />
      </Suspense>

      {/* 페이지 헤더 */}
      <div className="container mx-auto px-6 lg:px-10 pt-10 pb-8">
        <div className="flex items-baseline justify-between">
          <div>
            {searchParams.q ? (
              <>
                <p className="text-[9px] tracking-[0.4em] text-gray-400 uppercase mb-1">Search Results</p>
                <h1 className="text-xl font-black tracking-tight">&ldquo;{searchParams.q}&rdquo;</h1>
              </>
            ) : categoryLabel ? (
              <>
                <p className="text-[9px] tracking-[0.4em] text-gray-400 uppercase mb-1">Category</p>
                <h1 className="text-xl font-black tracking-tight">
                  {subLabel ? `${categoryLabel} · ${subLabel}` : categoryLabel}
                </h1>
              </>
            ) : (
              <>
                <p className="text-[9px] tracking-[0.4em] text-gray-400 uppercase mb-1">Collection</p>
                <h1 className="text-xl font-black tracking-tight">ALL PRODUCTS</h1>
              </>
            )}
          </div>
          <span className="text-xs text-gray-300 tabular-nums sm:hidden">{products.length}개</span>
        </div>
      </div>

      {/* 상품 그리드 */}
      <div className="container mx-auto px-6 lg:px-10 pb-24">
        <ProductGrid products={products} />
      </div>
    </div>
  )
}
