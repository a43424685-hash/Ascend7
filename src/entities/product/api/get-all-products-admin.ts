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
      (a, b) => a.sort_order - b.sort_order
    ),
    variants: product.variants || [],
  })) as ProductWithDetails[]
}

