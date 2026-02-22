import { getSupabaseClient } from '@/shared/api/supabaseClient'

export interface FlashSaleWithProduct {
  id: string
  title: string
  sale_price: number
  original_price: number
  discount_percent: number
  end_at: string
  max_quantity: number | null
  sold_quantity: number
  is_active: boolean
  product: {
    id: string
    name: string
    slug: string
    images: { url: string; sort_order: number }[]
  } | null
  variant: {
    id: string
    color: string
    size: string
    sku: string
    stock: number
  } | null
}

export async function getActiveFlashSales(): Promise<FlashSaleWithProduct[]> {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('flash_sales')
    .select(`
      id, title, sale_price, original_price, discount_percent,
      end_at, max_quantity, sold_quantity, is_active,
      product:products (
        id, name, slug,
        images:product_images (url, sort_order)
      ),
      variant:variants (id, color, size, sku, stock)
    `)
    .eq('is_active', true)
    .gt('end_at', now)
    .order('end_at', { ascending: true })

  if (error || !data) return []

  return data.map((item: any) => ({
    ...item,
    product: Array.isArray(item.product) ? item.product[0] : item.product,
    variant: Array.isArray(item.variant) ? item.variant[0] : item.variant,
  })) as FlashSaleWithProduct[]
}
