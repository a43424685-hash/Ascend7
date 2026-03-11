'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { requireAdmin } from '@/shared/lib/auth/admin'

export async function deleteProduct(productId: string) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()

    // 관련 데이터 먼저 삭제 (FK CASCADE 미설정 대비)
    await supabase.from('variants').delete().eq('product_id', productId)
    await supabase.from('product_images').delete().eq('product_id', productId)

    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/products')
    revalidatePath('/shop')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
