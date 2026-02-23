'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

const EARN_RATE = 0.01 // 1% 적립

export async function earnPointsForOrder(
  userId: string,
  orderId: string,
  orderTotal: number
): Promise<void> {
  const points = Math.floor(orderTotal * EARN_RATE)
  if (points <= 0) return

  const supabase = createAdminClient()

  // 중복 적립 방지
  const { data: existing } = await supabase
    .from('point_transactions')
    .select('id')
    .eq('order_id', orderId)
    .eq('type', 'earn')
    .single()

  if (existing) return

  await supabase.from('point_transactions').insert({
    user_id: userId,
    order_id: orderId,
    amount: points,
    type: 'earn',
    description: `주문 적립 (1%)`,
  })
}

export async function spendPoints(
  userId: string,
  orderId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  // 현재 잔액 확인
  const { data: txs } = await supabase
    .from('point_transactions')
    .select('amount, type')
    .eq('user_id', userId)

  const balance = (txs || []).reduce((sum, tx) => {
    return sum + (tx.type === 'earn' ? tx.amount : -tx.amount)
  }, 0)

  if (balance < 5000) {
    return { success: false, error: '포인트는 5,000P 이상 보유 시 사용할 수 있습니다.' }
  }
  if (balance < amount) {
    return { success: false, error: '포인트 잔액이 부족합니다.' }
  }

  const { error } = await supabase.from('point_transactions').insert({
    user_id: userId,
    order_id: orderId,
    amount,
    type: 'spend',
    description: '주문 사용',
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
