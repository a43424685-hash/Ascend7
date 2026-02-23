'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

/**
 * 리뷰 작성 완료 시 포인트 지급
 * - 텍스트 리뷰: 1,000P
 * - 포토 리뷰 (이미지 첨부): 2,000P
 */
export async function awardReviewPoints(
  userId: string,
  reviewId: string,
  hasPhoto: boolean
): Promise<void> {
  const points = hasPhoto ? 2000 : 1000
  const supabase = createAdminClient()

  // 중복 지급 방지
  const { data: existing } = await supabase
    .from('point_transactions')
    .select('id')
    .eq('user_id', userId)
    .ilike('description', `%${reviewId}%`)
    .limit(1)
    .maybeSingle()

  if (existing) return

  await supabase.from('point_transactions').insert({
    user_id: userId,
    amount: points,
    type: 'earn',
    description: hasPhoto
      ? `포토리뷰 작성 적립 (+2,000P) [${reviewId}]`
      : `텍스트리뷰 작성 적립 (+1,000P) [${reviewId}]`,
  })
}
