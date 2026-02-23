'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { getSupabaseClient } from '@/shared/api/supabaseClient'

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

  const normalizedCode = code.trim().toUpperCase()
  const adminSupabase = createAdminClient()

  // 1. 기존 coupons 테이블에서 조회
  const { data: coupon } = await adminSupabase
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .eq('is_active', true)
    .single()

  if (coupon) {
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

  // 2. events 테이블에서 이벤트 쿠폰 조회 (is_active만 체크, 날짜는 관리자가 직접 제어)
  const { data: event } = await adminSupabase
    .from('events')
    .select('*')
    .eq('coupon_code', normalizedCode)
    .eq('is_active', true)
    .single()

  if (!event) {
    return { valid: false, error: '유효하지 않은 쿠폰 코드입니다.' }
  }

  // 최소 주문금액 체크
  if (event.min_order_amount > 0 && subtotal < event.min_order_amount) {
    return {
      valid: false,
      error: `${Number(event.min_order_amount).toLocaleString()}원 이상 주문 시 사용 가능합니다.`,
    }
  }

  // 1인 1회 사용 제한 체크
  if (event.single_use) {
    try {
      const supabase = await getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: usage } = await adminSupabase
          .from('event_coupon_usages')
          .select('id')
          .eq('event_id', event.id)
          .eq('user_id', user.id)
          .single()

        if (usage) {
          return { valid: false, error: '이미 사용한 쿠폰입니다.' }
        }
      }
    } catch {
      // 유저 조회 실패 시 통과 (비회원 허용)
    }
  }

  // 할인 계산 (SQL 마이그레이션 미실행 시 discount_value가 undefined일 수 있으므로 안전 처리)
  const discountType = event.discount_type as string | null | undefined
  const discountValue = Number(event.discount_value) || 0

  if (!discountType || discountValue <= 0) {
    return { valid: false, error: '이벤트 할인 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.' }
  }

  let discountAmount = 0
  if (discountType === 'percent') {
    discountAmount = Math.floor(subtotal * (discountValue / 100))
  } else {
    discountAmount = discountValue
  }
  discountAmount = Math.min(Math.max(0, discountAmount), subtotal)

  return {
    valid: true,
    couponId: event.id,
    couponCode: normalizedCode,
    discountAmount,
  }
}
