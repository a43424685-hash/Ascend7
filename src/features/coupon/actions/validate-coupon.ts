'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export interface CouponValidationResult {
  valid: boolean
  couponId?: string
  couponCode?: string
  discountAmount?: number
  error?: string
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  if (!code.trim()) {
    return { valid: false, error: '쿠폰 코드를 입력해주세요.' }
  }

  const adminSupabase = createAdminClient()
  const { data: coupon, error } = await adminSupabase
    .from('coupons')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return { valid: false, error: '유효하지 않은 쿠폰 코드입니다.' }
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: '만료된 쿠폰입니다.' }
  }

  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      error: `${Number(coupon.min_order_amount).toLocaleString()}원 이상 주문 시 사용 가능합니다.`,
    }
  }

  if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, error: '사용 가능 횟수를 초과한 쿠폰입니다.' }
  }

  let discountAmount = 0
  if (coupon.type === 'percentage') {
    discountAmount = Math.floor(subtotal * (coupon.value / 100))
    if (coupon.max_discount_amount) {
      discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount))
    }
  } else {
    discountAmount = Number(coupon.value)
  }
  discountAmount = Math.min(discountAmount, subtotal)

  return {
    valid: true,
    couponId: coupon.id,
    couponCode: coupon.code,
    discountAmount,
  }
}
