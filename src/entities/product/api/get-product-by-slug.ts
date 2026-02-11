import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { ProductWithDetails, Variant } from '@/shared/types/database'

export async function getProductBySlug(
  slug: string
): Promise<ProductWithDetails | null> {
  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:variants(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    const product = {
      ...data,
      images: (data.images || []).sort(
        (a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
      ),
      variants: (data.variants || []).filter((v: Variant) => v.is_active),
    } as ProductWithDetails

    return product
  } catch (err) {
    return null
  }
}
