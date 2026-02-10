import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { ProductWithDetails, Variant } from '@/shared/types/database'

export async function getProductBySlug(
  slug: string
): Promise<ProductWithDetails | null> {
  console.log('📦 getProductBySlug 호출됨', { slug })

  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:variants(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      console.log('⚠️ 제품을 찾을 수 없음:', slug)
      return null
    }

    const product = {
      ...data,
      images: (data.images || []).sort(
        (a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0) 
      ),
      variants: (data.variants || []).filter(
        (v: Variant) => v.is_active
      ),
    } as ProductWithDetails

    console.log('✅ 제품 조회 완료:', {
      name: product.name,
      variantsCount: product.variants.length,
      imagesCount: product.images.length,
    })

    return product
  } catch (err) {
    console.error('❌ 제품 조회 오류:', err)
    return null
  }
}

