'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { awardReviewPoints } from './award-review-points'

const BODY_TYPES = ['마른 편', '보통', '통통한 편', '근육질', '기타']

export async function submitReview(data: {
  product_id: string
  rating: number
  title?: string
  content: string
  image_urls?: string[]
  height?: number | null
  weight?: number | null
  body_type?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  if (!data.content?.trim()) return { success: false, error: '리뷰 내용을 입력해주세요.' }
  if (data.rating < 1 || data.rating > 5) return { success: false, error: '별점을 선택해주세요.' }
  if (data.body_type && !BODY_TYPES.includes(data.body_type)) return { success: false, error: '올바른 체형을 선택해주세요.' }

  const adminSupabase = createAdminClient()

  // 중복 리뷰 체크 (동일 상품)
  const { data: existing } = await adminSupabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', data.product_id)
    .maybeSingle()

  if (existing) return { success: false, error: '이미 해당 상품에 리뷰를 작성하셨습니다.' }

  const { data: review, error } = await adminSupabase
    .from('reviews')
    .insert({
      user_id: user.id,
      product_id: data.product_id,
      rating: data.rating,
      title: data.title?.trim() || null,
      content: data.content.trim(),
      image_urls: data.image_urls ?? [],
      height: data.height || null,
      weight: data.weight || null,
      body_type: data.body_type || null,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  // 포인트 자동 지급
  const hasPhoto = (data.image_urls?.length ?? 0) > 0
  await awardReviewPoints(user.id, review.id, hasPhoto)

  revalidatePath('/community/review')
  return { success: true }
}
