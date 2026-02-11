import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { getFeaturedProducts } from '@/entities/product/api/get-featured-products'
import { ProductGrid } from '@/widgets/product-grid'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = []
  let error: string | null = null

  try {
    featuredProducts = await getFeaturedProducts(4)
  } catch (err: any) {
    error = err.message
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
            <p className="text-red-800 font-semibold mb-2">
              제품을 불러올 수 없습니다
            </p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <>
            <ProductGrid products={featuredProducts} />
            <div className="text-center mt-8">
              <Link href="/shop">
                <Button variant="outline">VIEW ALL</Button>
              </Link>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">제품이 없습니다.</p>
        )}
      </section>
    </div>
  )
}
