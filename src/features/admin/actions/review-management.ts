'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { requireAdmin } from '@/shared/lib/auth/admin'

export async function createReviewByAdmin(data: {
  admin_author_name: string
  product_id: string
  rating: number
  title?: string
  content: string
  image_urls?: string[]
  height?: number | null
  weight?: number | null
  body_type?: string | null
  created_at?: string // YYYY-MM-DD
}) {
  try {
    const adminUser = await requireAdmin()
    if (!data.admin_author_name?.trim()) return { success: false, error: '표시 이름을 입력해주세요.' }
    if (!data.content?.trim()) return { success: false, error: '리뷰 내용을 입력해주세요.' }
    if (!data.product_id) return { success: false, error: '상품을 선택해주세요.' }
    if (data.rating < 1 || data.rating > 5) return { success: false, error: '별점을 선택해주세요.' }

    const supabase = createAdminClient()
    const { error } = await supabase.from('reviews').insert({
      user_id: adminUser.id,
      product_id: data.product_id,
      rating: data.rating,
      title: data.title?.trim() || null,
      content: data.content.trim(),
      admin_author_name: data.admin_author_name.trim(),
      image_urls: data.image_urls ?? [],
      height: data.height || null,
      weight: data.weight || null,
      body_type: data.body_type || null,
      is_active: true,
      ...(data.created_at ? { created_at: `${data.created_at}T00:00:00.000Z` } : {}),
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/reviews')
    revalidatePath('/community/review')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateReviewByAdmin(reviewId: string, data: {
  admin_author_name: string
  product_id?: string
  rating: number
  title?: string
  content: string
  image_urls?: string[]
  height?: number | null
  weight?: number | null
  body_type?: string | null
  created_at?: string // YYYY-MM-DD
}) {
  try {
    await requireAdmin()
    if (!data.admin_author_name?.trim()) return { success: false, error: '표시 이름을 입력해주세요.' }
    if (!data.content?.trim()) return { success: false, error: '리뷰 내용을 입력해주세요.' }
    if (data.rating < 1 || data.rating > 5) return { success: false, error: '별점을 선택해주세요.' }

    const supabase = createAdminClient()

    // 직접 작성한 리뷰인지 확인
    const { data: existing } = await supabase
      .from('reviews')
      .select('id, admin_author_name')
      .eq('id', reviewId)
      .single()

    if (!existing?.admin_author_name) return { success: false, error: '직접 작성한 리뷰만 수정할 수 있습니다.' }

    const updateData: Record<string, any> = {
      admin_author_name: data.admin_author_name.trim(),
      rating: data.rating,
      title: data.title?.trim() || null,
      content: data.content.trim(),
      image_urls: data.image_urls ?? [],
      height: data.height || null,
      weight: data.weight || null,
      body_type: data.body_type || null,
    }

    if (data.product_id) updateData.product_id = data.product_id
    if (data.created_at) updateData.created_at = `${data.created_at}T00:00:00.000Z`

    const { error } = await supabase.from('reviews').update(updateData).eq('id', reviewId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/reviews')
    revalidatePath('/community/review')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

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
