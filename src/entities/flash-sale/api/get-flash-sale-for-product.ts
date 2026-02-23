'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import type { FlashSaleWithProduct } from './get-flash-sales'

export async function getFlashSaleForProduct(productId: string): Promise<FlashSaleWithProduct | null> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('flash_sales')
    .select(`
      id, title, sale_price, original_price, discount_percent,
      end_at, max_quantity, sold_quantity, is_active,
      product:products (id, name, slug, images:product_images(url, sort_order)),
      variant:variants (id, color, size, sku, stock)
    `)
    .eq('product_id', productId)
    .eq('is_active', true)
    .gt('end_at', now)
    .order('end_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!data) return null

  return {
    ...data,
    product: Array.isArray(data.product) ? data.product[0] : data.product,
    variant: Array.isArray(data.variant) ? data.variant[0] : data.variant,
  } as FlashSaleWithProduct
}
