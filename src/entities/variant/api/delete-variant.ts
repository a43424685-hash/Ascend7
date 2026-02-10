'use server'

import { getSupabaseClient } from '@/shared/api/supabaseClient'
import { revalidatePath } from 'next/cache'

export async function deleteVariant(id: string, productId: string) {
  const supabase = await getSupabaseClient()

  const { error } = await supabase.from('variants').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete variant: ${error.message}`)
  }

  revalidatePath(`/admin/products/${productId}`)
}

