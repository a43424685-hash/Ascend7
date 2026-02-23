'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export interface UserPointInfo {
  userId: string
  email: string
  balance: number
}

export async function getUserPointInfoByEmail(email: string): Promise<UserPointInfo | null> {
  const supabase = createAdminClient()

  // 이메일로 유저 찾기
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.find(u => u.email === email)
  if (!user) return null

  // 포인트 잔액 계산
  const { data: txs } = await supabase
    .from('point_transactions')
    .select('amount, type')
    .eq('user_id', user.id)

  const balance = (txs || []).reduce((sum, tx) => {
    return sum + (tx.type === 'earn' ? tx.amount : -tx.amount)
  }, 0)

  return { userId: user.id, email, balance: Math.max(0, balance) }
}

export async function adminAdjustPoints(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; error?: string }> {
  if (!amount || !description.trim()) {
    return { success: false, error: '금액과 사유를 입력해주세요.' }
  }

  const supabase = createAdminClient()
  const type = amount > 0 ? 'earn' : 'spend'

  const { error } = await supabase.from('point_transactions').insert({
    user_id: userId,
    amount: Math.abs(amount),
    type,
    description: `[어드민 수동 조정] ${description}`,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
