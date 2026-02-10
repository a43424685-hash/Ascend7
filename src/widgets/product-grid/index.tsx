import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithImages } from '@/shared/types/database'
import { formatPrice } from '@/shared/lib/utils'

interface ProductGridProps {
  products: ProductWithImages[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">제품을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const mainImage = product.images[0]?.url
        const activeVariants = product.variants?.filter((v) => v.is_active) || []
        const variantPrices = activeVariants.map((v) => v.price)
        const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0
        const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : 0
        const hasStock = activeVariants.some((v) => v.stock > 0)
        const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0)

        return (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group"
          >
            <div className="aspect-square relative bg-gray-100 overflow-hidden">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {minPrice > 0 ? (
                    minPrice === maxPrice ? (
                      formatPrice(minPrice)
                    ) : (
                      `${formatPrice(minPrice)} ~ ${formatPrice(maxPrice)}`
                    )
                  ) : (
                    '가격 문의'
                  )}
                </p>
                {!hasStock && (
                  <span className="text-xs text-red-600 font-medium">품절</span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

