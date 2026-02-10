import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { getFeaturedProducts } from '@/entities/product/api/get-featured-products'
import { ProductGrid } from '@/widgets/product-grid'

export default async function HomePage() {
  console.log('🏠 홈 페이지 렌더링 시작')
  
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = []
  let error: string | null = null

  try {
    // 최신 4개 제품 조회
    featuredProducts = await getFeaturedProducts(4)
    console.log('✅ Featured 제품 로드 완료:', featuredProducts.length, '개')
  } catch (err: any) {
    error = err.message
    console.error('❌ 제품 로드 실패:', err.message)
    console.error('상세 에러:', err)
  }

  return (
    <div>
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">ASCEND7</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Elevate your training with premium gymwear designed for performance
        </p>
        <Link href="/shop">
          <Button size="lg">SHOP NOW</Button>
        </Link>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">FEATURED</h2>
        {error ? (
          <div className="bg-red-50 border-2 border-red-200 p-6 text-center">
            <p className="text-red-800 font-semibold mb-2">❌ 제품을 불러올 수 없습니다</p>
            <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-center text-sm text-gray-600">
              {featuredProducts.length > 0 
                ? `✅ ${featuredProducts.length}개의 제품을 불러왔습니다`
                : '⚠️ 제품이 없습니다. Supabase에 데이터를 추가하세요.'}
            </div>
            <ProductGrid products={featuredProducts} />
            <div className="text-center mt-8">
              <Link href="/shop">
                <Button variant="outline">VIEW ALL</Button>
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

