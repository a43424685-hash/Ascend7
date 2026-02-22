'use server'

import { getSupabaseClient } from '@/shared/api/supabaseClient'
import { revalidatePath } from 'next/cache'

export type CreateProductInput = {
  name: string
  slug: string
  description?: string
  category: string
  sub_category?: string | null
  is_active?: boolean
}

export async function createProduct(input: CreateProductInput) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      category: input.category,
      sub_category: input.sub_category || null,
      is_active: input.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`)
  }

  revalidatePath('/admin/products')
  revalidatePath('/shop')
  revalidatePath('/')

  return data
}
