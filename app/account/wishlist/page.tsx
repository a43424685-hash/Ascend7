import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'
import { ProductGrid } from '@/widgets/product-grid'

export const dynamic = 'force-dynamic'

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 찜한 상품 조회
  const { data: wishlists } = await supabase
    .from('wishlists')
    .select(`
      product_id,
      product:products (
        id, name, slug, category, is_active,
        images:product_images (id, url, sort_order),
        variants (id, color, size, price, stock, is_active, sku)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const products = (wishlists || [])
    .map((w: any) => {
      const p = Array.isArray(w.product) ? w.product[0] : w.product
      if (!p) return null
      return {
        ...p,
        images: (p.images || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
        variants: (p.variants || []).filter((v: any) => v.is_active),
      }
    })
    .filter(Boolean)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/account" className="text-sm text-gray-400 hover:text-black mb-2 inline-block">
            ← 마이페이지
          </Link>
          <h1 className="text-2xl font-bold">찜한 상품</h1>
          <p className="text-sm text-gray-400 mt-1">{products.length}개 상품</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-gray-400 mb-4">찜한 상품이 없습니다</p>
          <Link href="/shop" className="text-sm font-medium underline hover:no-underline">
            쇼핑하러 가기 →
          </Link>
        </div>
      ) : (
        <ProductGrid products={products as any} />
      )}
    </div>
  )
}
