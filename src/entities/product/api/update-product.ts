'use server'

import { getSupabaseClient } from '@/shared/api/supabaseClient'
import { revalidatePath } from 'next/cache'

export type UpdateProductInput = {
  id: string
  name?: string
  slug?: string
  description?: string
  detail_content?: string
  size_material_care?: string | null
  category?: string
  is_active?: boolean
}

export async function updateProduct(input: UpdateProductInput) {
  const supabase = await getSupabaseClient()

  const { id, ...updates } = input

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`)
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}`)
  revalidatePath('/shop')
  revalidatePath('/')

  return data
}

