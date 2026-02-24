import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProductBySlug } from '@/entities/product/api/get-product-by-slug'
import { getProductsWithFilters } from '@/entities/product/api/get-products-with-filters'
import { getSiteSettings } from '@/entities/cms/api/get-site-settings'
import { getFlashSaleForProduct } from '@/entities/flash-sale/api/get-flash-sale-for-product'
import { getComingSoonSlugs } from '@/entities/product/api/get-coming-soon-slugs'
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

  // 배송 정책 + 추천 상품 + 타임딜 + 준비중 슬러그 병렬 조회
  const [siteSettings, allProducts, flashSale, comingSoonSlugs] = await Promise.all([
    getSiteSettings(),
    getProductsWithFilters({ category: product.category }),
    getFlashSaleForProduct(product.id),
    getComingSoonSlugs(),
  ])
  const recommendations = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ascend7.kr'
  const activeVariants = product.variants.filter((v) => v.is_active)
  const prices = activeVariants.map((v) => v.price)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - ASCEND7 프리미엄 짐웨어`,
    image: product.images.map((img) => img.url),
    url: `${baseUrl}/product/${product.slug}`,
    brand: { '@type': 'Brand', name: 'ASCEND7' },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'KRW',
      price: minPrice,
      availability:
        product.is_coming_soon || totalStock === 0
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'ASCEND7' },
    },
  }

  return (
    <div className="pb-20 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 상단 2컬럼: 갤러리 + 구매박스 */}
      <div className="container mx-auto px-4 pt-6 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductDetails product={product} flashSale={flashSale} />
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
          isComingSoon: product.is_coming_soon,
        }}
        comingSoonSlugs={comingSoonSlugs}
      />

      {/* 추천 상품 */}
      {recommendations.length > 0 && (
        <div className="container mx-auto px-4 mt-16 lg:mt-24">
          <h2 className="text-xl lg:text-2xl font-bold mb-8">추천 상품</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {recommendations.map((p) => {
              const mainImage = p.images[0]?.url
              const activeVariants = p.variants?.filter((v) => v.is_active) || []
              const variantPrices = activeVariants.map((v) => v.price)
              const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0
              const hasStock = activeVariants.some((v) => v.stock > 0)
              const isComingSoon = p.is_coming_soon === true

              const imageArea = (
                <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden mb-3">
                  <div className={isComingSoon ? 'absolute inset-0 blur-sm opacity-40' : 'absolute inset-0'}>
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={p.name}
                        fill
                        className={`object-cover transition-transform duration-300 ${!isComingSoon ? 'group-hover:scale-105' : ''}`}
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                  </div>
                  {isComingSoon && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="text-[11px] font-bold tracking-[0.3em] text-white uppercase">Coming Soon</span>
                    </div>
                  )}
                  {!isComingSoon && !hasStock && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 font-medium">
                      품절
                    </div>
                  )}
                </div>
              )

              if (isComingSoon) {
                return (
                  <div key={p.id} className="cursor-default select-none">
                    {imageArea}
                    <h3 className="text-sm font-semibold mb-1 truncate">{p.name}</h3>
                    <p className="text-sm"><span className="text-orange-400 text-xs">준비중</span></p>
                  </div>
                )
              }

              return (
                <Link key={p.id} href={`/product/${p.slug}`} className="group">
                  {imageArea}
                  <h3 className="text-sm font-semibold mb-1 truncate">{p.name}</h3>
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
              title="인스타그램"
              desc="팔로우하고 신제품 소식 받아보세요"
              href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={1.5} />
                  <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
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
  href,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  href?: string
}) {
  const content = (
    <div className="text-center space-y-2">
      <div className="w-10 h-10 mx-auto text-gray-600 flex items-center justify-center">
        {icon}
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  )
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-70 transition-opacity">
        {content}
      </a>
    )
  }
  return content
}
