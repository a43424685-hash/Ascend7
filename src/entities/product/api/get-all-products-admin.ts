import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { ProductWithDetails } from '@/shared/types/database'

export async function getAllProductsAdmin(): Promise<ProductWithDetails[]> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:variants(*)')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return (data || []).map((product) => ({
    ...product,
    images: (product.images || []).sort(
      (a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
    ),
    variants: product.variants || [],
  })) as ProductWithDetails[]
}

