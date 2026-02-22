'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getSupabaseClient } from '@/shared/api/supabaseClient'

export async function requestRestockAlert(
  variantId: string,
  notificationType: 'email' | 'kakao',
  email?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 이메일 결정: 로그인 사용자는 가입 이메일, 비로그인은 입력값
  const resolvedEmail = notificationType === 'email'
    ? (user?.email || email || '').toLowerCase().trim()
    : (user?.email || '').toLowerCase().trim()

  if (notificationType === 'email') {
    if (!resolvedEmail || !resolvedEmail.includes('@')) {
      return { success: false, error: '올바른 이메일 주소를 입력해주세요.' }
    }
  }

  const adminSupabase = createAdminClient()

  // 중복 신청 체크
  const orFilter = resolvedEmail
    ? `product_variant_id.eq.${variantId},email.eq.${resolvedEmail}`
    : undefined

  if (resolvedEmail) {
    const { data: existing } = await adminSupabase
      .from('restock_alerts')
      .select('id')
      .eq('product_variant_id', variantId)
      .eq('email', resolvedEmail)
      .is('notified_at', null)
      .maybeSingle()

    if (existing) {
      return { success: false, error: '이미 재입고 알림을 신청하셨습니다.' }
    }
  }

  const { error } = await adminSupabase.from('restock_alerts').insert({
    product_variant_id: variantId,
    email: resolvedEmail || null,
    user_id: user?.id || null,
    notification_type: notificationType,
  })

  if (error) {
    return { success: false, error: '신청에 실패했습니다. 다시 시도해주세요.' }
  }

  return { success: true }
}
