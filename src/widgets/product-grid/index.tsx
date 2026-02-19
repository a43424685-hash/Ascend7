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
      <div className="text-center py-24 px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">제품을 찾을 수 없습니다</p>
        <p className="text-gray-400 text-sm mt-1">다른 카테고리를 선택해보세요</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => {
        const mainImage = product.images[0]?.url
        const secondImage = product.images[1]?.url
        const activeVariants = product.variants?.filter((v) => v.is_active) || []
        const variantPrices = activeVariants.map((v) => v.price)
        const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0
        const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : 0
        const hasStock = activeVariants.some((v) => v.stock > 0)

        return (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group card-hover block"
          >
            <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
              {mainImage ? (
                <>
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={`object-cover transition-all duration-500 group-hover:scale-105 ${secondImage ? 'group-hover:opacity-0' : ''}`}
                  />
                  {secondImage && (
                    <Image
                      src={secondImage}
                      alt={`${product.name} - 2`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
              {!hasStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xs font-bold tracking-wider">SOLD OUT</span>
                </div>
              )}
            </div>
            <div className="mt-3 sm:mt-4">
              <h3 className="text-xs sm:text-sm font-semibold tracking-tight line-clamp-1">{product.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {minPrice > 0 ? (
                  minPrice === maxPrice ? (
                    formatPrice(minPrice)
                  ) : (
                    `${formatPrice(minPrice)} ~`
                  )
                ) : (
                  '가격 문의'
                )}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
