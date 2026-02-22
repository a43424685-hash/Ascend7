'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getSupabaseClient } from '@/shared/api/supabaseClient'

export async function requestRestockAlert(
  variantId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, error: '올바른 이메일 주소를 입력해주세요.' }
  }

  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminSupabase = createAdminClient()

  // 중복 신청 체크
  const { data: existing } = await adminSupabase
    .from('restock_alerts')
    .select('id')
    .eq('product_variant_id', variantId)
    .eq('email', email.toLowerCase().trim())
    .is('notified_at', null)
    .maybeSingle()

  if (existing) {
    return { success: false, error: '이미 재입고 알림을 신청하셨습니다.' }
  }

  const { error } = await adminSupabase.from('restock_alerts').insert({
    product_variant_id: variantId,
    email: email.toLowerCase().trim(),
    user_id: user?.id || null,
  })

  if (error) {
    return { success: false, error: '신청에 실패했습니다. 다시 시도해주세요.' }
  }

  return { success: true }
}
