'use server'

import { getSupabaseClient } from '@/shared/api/supabaseClient'
import { revalidatePath } from 'next/cache'

export type CreateVariantInput = {
  product_id: string
  sku: string
  color: string
  size: string
  price: number
  stock: number
  is_active?: boolean
}

export async function createVariant(input: CreateVariantInput) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('variants')
    .insert({
      product_id: input.product_id,
      sku: input.sku,
      color: input.color,
      size: input.size,
      price: input.price,
      stock: input.stock,
      is_active: input.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create variant: ${error.message}`)
  }

  revalidatePath(`/admin/products/${input.product_id}`)

  return data
}

