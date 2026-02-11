import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { ProductWithImages, Variant } from '@/shared/types/database'

/**
 * Featured 제품 조회 (최신 N개)
 */
export async function getFeaturedProducts(
  limit: number = 4
): Promise<ProductWithImages[]> {
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
      variants: (product.variants || []).filter((v: Variant) => v.is_active),
    })) as ProductWithImages[]

    return processedProducts
  } catch (err) {
    throw err
  }
}
