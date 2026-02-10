'use server'

import { getSupabaseClient } from '@/shared/api/supabaseClient'
import { revalidatePath } from 'next/cache'

export type UpdateVariantInput = {
  id: string
  product_id: string
  sku?: string
  color?: string
  size?: string
  price?: number
  stock?: number
  is_active?: boolean
}

export async function updateVariant(input: UpdateVariantInput) {
  const supabase = await getSupabaseClient()

  const { id, product_id, ...updates } = input

  const { data, error } = await supabase
    .from('variants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update variant: ${error.message}`)
  }

  revalidatePath(`/admin/products/${product_id}`)

  return data
}

