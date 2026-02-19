'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import { requireAdmin } from '@/shared/lib/auth/admin'

export async function toggleReviewActive(reviewId: string, isActive: boolean) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('reviews')
      .update({ is_active: isActive })
      .eq('id', reviewId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/reviews')
    revalidatePath('/community/review')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteReview(reviewId: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/reviews')
    revalidatePath('/community/review')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
