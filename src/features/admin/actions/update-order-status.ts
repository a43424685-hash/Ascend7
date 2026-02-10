'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'canceled' | 'refunded'

/**
 * 주문 상태 변경
 * @param orderId - 주문 ID
 * @param newStatus - 새 상태
 * @param reason - 변경 이유 (선택)
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  reason?: string
) {
  const supabase = await createClient()

  // 1. 현재 사용자 확인 (관리자 권한 체크는 RLS에서 처리)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  // 2. 주문 상태 업데이트
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) {
    console.error('Failed to update order status:', error)
    throw new Error(`주문 상태 변경 실패: ${error.message}`)
  }

  // 3. 로그 수동 추가 (트리거가 자동으로 하지만, 이유(reason)를 포함하려면 수동 추가)
  if (reason) {
    await supabase
      .from('order_status_logs')
      .insert({
        order_id: orderId,
        to_status: newStatus,
        changed_by: user.id,
        reason,
      })
  }

  // 4. 캐시 무효화
  revalidatePath('/admin/orders')
  revalidatePath(`/account`)

  return { success: true }
}

