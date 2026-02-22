import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProductBySlug } from '@/entities/product/api/get-product-by-slug'
import { getProductsWithFilters } from '@/entities/product/api/get-products-with-filters'
import { getSiteSettings } from '@/entities/cms/api/get-site-settings'
import { ProductGallery } from '@/widgets/product-gallery'
import { ProductDetails } from '@/features/cart/product-details'
import { ProductDetailTabs } from '@/widgets/product-detail-tabs'
import { formatPrice } from '@/shared/lib/utils'
import { ProductReviews } from '@/widgets/product-reviews'
import { RecentlyViewedSection } from '@/widgets/recently-viewed'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return {}

  const firstImage = product.images?.[0]?.url
  const minPrice = Math.min(...product.variants.map((v) => v.price))

  return {
    title: product.name,
    description: product.description || `${product.name} - ASCEND7 프리미엄 짐웨어`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - ASCEND7 프리미엄 짐웨어`,
      images: firstImage ? [{ url: firstImage, width: 600, height: 800 }] : [],
      type: 'website',
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  // 배송 정책 + 추천 상품 병렬 조회
  const [siteSettings, allProducts] = await Promise.all([
    getSiteSettings(),
    getProductsWithFilters({ category: product.category }),
  ])
  const recommendations = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="pb-20 lg:pb-0">
      {/* 상단 2컬럼: 갤러리 + 구매박스 */}
      <div className="container mx-auto px-4 pt-6 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductDetails product={product} />
        </div>
      </div>

      {/* 상세 콘텐츠 영역 (아코디언) */}
      <div className="container mx-auto px-4 mt-16 lg:mt-24 max-w-4xl">
        <ProductDetailTabs product={product} shippingPolicy={siteSettings.shipping_policy} />
      </div>

      {/* 리뷰 섹션 */}
      <div className="container mx-auto px-4 max-w-4xl">
        <ProductReviews productId={product.id} productSlug={product.slug} />
      </div>

      {/* 최근 본 상품 */}
      <RecentlyViewedSection
        current={{
          slug: product.slug,
          name: product.name,
          imageUrl: product.images?.[0]?.url || null,
          price: product.variants.length > 0 ? Math.min(...product.variants.map((v) => v.price)) : 0,
        }}
      />

      {/* 추천 상품 */}
      {recommendations.length > 0 && (
        <div className="container mx-auto px-4 mt-16 lg:mt-24">
          <h2 className="text-xl lg:text-2xl font-bold mb-8">추천 상품</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {recommendations.map((p) => {
              const mainImage = p.images[0]?.url
              const activeVariants =
                p.variants?.filter((v) => v.is_active) || []
              const variantPrices = activeVariants.map((v) => v.price)
              const minPrice =
                variantPrices.length > 0 ? Math.min(...variantPrices) : 0
              const hasStock = activeVariants.some((v) => v.stock > 0)

              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group"
                >
                  <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden mb-3">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                    {!hasStock && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 font-medium">
                        품절
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold mb-1 truncate">
                    {p.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {minPrice > 0 ? formatPrice(minPrice) : '가격 문의'}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* 하단 안내 블록 (4칸) */}
      <div className="container mx-auto px-4 mt-16 lg:mt-24 mb-8">
        <div className="border-t border-gray-200 pt-10">
          <div className="grid grid-cols-3 gap-6 lg:gap-8">
            <FooterInfoItem
              title="무료배송"
              desc="50,000원 이상 구매 시"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
              }
            />
            <FooterInfoItem
              title="교환/반품"
              desc="수령 후 7일 이내"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
            />
            <FooterInfoItem
              title="신제품 알림"
              desc="SNS 팔로우"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FooterInfoItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="text-center space-y-2">
      <div className="w-10 h-10 mx-auto text-gray-600 flex items-center justify-center">
        {icon}
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  )
}
