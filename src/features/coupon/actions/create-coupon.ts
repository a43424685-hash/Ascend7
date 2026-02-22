'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface CreateCouponInput {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_amount?: number
  max_discount_amount?: number
  usage_limit?: number | null
  expires_at?: string | null
}

export async function createCoupon(input: CreateCouponInput) {
  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('coupons')
    .insert({
      code: input.code.trim().toUpperCase(),
      type: input.type,
      value: input.value,
      min_order_amount: input.min_order_amount || 0,
      max_discount_amount: input.max_discount_amount || null,
      usage_limit: input.usage_limit || null,
      expires_at: input.expires_at || null,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('이미 사용 중인 쿠폰 코드입니다.')
    throw new Error(`쿠폰 생성 실패: ${error.message}`)
  }

  revalidatePath('/admin/coupons')
  return data
}

export async function toggleCoupon(id: string, isActive: boolean) {
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('coupons')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) throw new Error(`쿠폰 수정 실패: ${error.message}`)
  revalidatePath('/admin/coupons')
}
