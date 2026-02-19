import { getProductsWithFilters } from '@/entities/product/api/get-products-with-filters'
import { ProductGrid } from '@/widgets/product-grid'

export const dynamic = 'force-dynamic'

export default async function NewArrivalsPage() {
  let products: Awaited<ReturnType<typeof getProductsWithFilters>> = []

  try {
    products = await getProductsWithFilters({ sortBy: 'newest' })
  } catch {
    // silently fail
  }

  return (
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-10 py-10">
          <p className="text-[9px] tracking-[0.4em] text-gray-400 uppercase mb-1">Latest</p>
          <h1 className="text-xl font-black tracking-tight">NEW ARRIVALS</h1>
        </div>
      </div>

      {/* 상품 그리드 */}
      <div className="container mx-auto px-6 lg:px-10 py-12 pb-24">
        <div className="flex items-baseline justify-between mb-10">
          <p className="text-[10px] text-gray-300 tracking-wider tabular-nums">{products.length}개</p>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  )
}
