'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { requireAdmin } from '@/shared/lib/auth/admin'
import { revalidatePath } from 'next/cache'

export async function toggleComingSoon(
  productId: string,
  value: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .update({ is_coming_soon: value })
      .eq('id', productId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/products')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
