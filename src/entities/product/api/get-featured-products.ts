import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { ProductWithImages, Variant } from '@/shared/types/database'

/**
 * Featured 제품 조회 (최신 4개)
 */
export async function getFeaturedProducts(
  limit: number = 4
): Promise<ProductWithImages[]> {
  console.log('⭐ getFeaturedProducts 호출됨', { limit })

  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:variants(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Featured 제품 조회 실패: ${error.message}`)
    }

    if (!data) {
      return []
    }

    const processedProducts = data.map((product) => ({
      ...product,
      images: (product.images || []).sort(
        (a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
      ),
      variants: (product.variants || []).filter(
        (v: Variant) => v.is_active
      ),
    })) as ProductWithImages[]

    console.log('✅ Featured 제품 처리 완료:', {
      총개수: processedProducts.length,
      제품명: processedProducts.map(p => p.name),
    })

    return processedProducts
  } catch (err) {
    console.error('❌ Featured 제품 조회 오류:', err)
    throw err
  }
}

