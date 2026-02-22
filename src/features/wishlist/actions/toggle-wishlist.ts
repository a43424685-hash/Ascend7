'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(productId: string): Promise<{
  success: boolean
  wishlisted: boolean
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, wishlisted: false, error: '로그인이 필요합니다.' }
  }

  // 현재 찜 여부 확인
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    // 찜 취소
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', existing.id)

    if (error) return { success: false, wishlisted: true, error: error.message }

    revalidatePath('/account/wishlist')
    return { success: true, wishlisted: false }
  } else {
    // 찜 추가
    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, product_id: productId })

    if (error) return { success: false, wishlisted: false, error: error.message }

    revalidatePath('/account/wishlist')
    return { success: true, wishlisted: true }
  }
}

export async function getWishlistProductIds(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id)

  return (data || []).map((w) => w.product_id)
}
