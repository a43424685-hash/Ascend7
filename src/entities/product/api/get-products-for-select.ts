'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export interface ProductForSelect {
  id: string
  name: string
  slug: string
  variants: VariantForSelect[]
}

export interface VariantForSelect {
  id: string
  sku: string
  color: string
  size: string
  price: number
  stock: number
  is_active: boolean
}

export async function getProductsForSelect(): Promise<ProductForSelect[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, variants(id, sku, color, size, price, stock, is_active)')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error || !data) return []
  return data as ProductForSelect[]
}
