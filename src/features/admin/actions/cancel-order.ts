'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * 주문 취소 및 재고 복구
 * @param orderId - 주문 ID
 * @param reason - 취소 이유
 */
export async function cancelOrder(orderId: string, reason: string) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  // 1. 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  // 2. 주문 조회
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select(`
      id,
      status,
      order_items (
        variant_id,
        quantity
      )
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    throw new Error('주문을 찾을 수 없습니다.')
  }

  // 3. 이미 취소/환불된 주문은 처리 불가
  if (order.status === 'canceled' || order.status === 'refunded') {
    throw new Error('이미 취소되거나 환불된 주문입니다.')
  }

  // 4. 재고 복구
  if (order.order_items && order.order_items.length > 0) {
    for (const item of order.order_items) {
      const { error: stockError } = await adminSupabase
        .rpc('atomic_restore_stock', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        })

      if (stockError) {
        console.error(`Failed to restore stock for variant ${item.variant_id}:`, stockError)
        // 계속 진행 (재고 복구 실패해도 취소는 진행)
      }
    }
  }

  // 5. 주문 상태 변경
  const { error: updateError } = await adminSupabase
    .from('orders')
    .update({ status: 'canceled' })
    .eq('id', orderId)

  if (updateError) {
    throw new Error(`주문 취소 실패: ${updateError.message}`)
  }

  // 6. 로그 기록
  await adminSupabase
    .from('order_status_logs')
    .insert({
      order_id: orderId,
      to_status: 'canceled',
      changed_by: user.id,
      reason,
      metadata: {
        action: 'cancel',
        timestamp: new Date().toISOString(),
      },
    })

  // 7. 캐시 무효화
  revalidatePath('/admin/orders')
  revalidatePath('/account')

  console.log(`✅ Order ${orderId} canceled and stock restored`)

  return { success: true }
}

