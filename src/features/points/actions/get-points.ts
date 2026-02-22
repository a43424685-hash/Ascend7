'use server'

import { createClient } from '@/shared/lib/supabase/server'

export async function getUserPointBalance(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data } = await supabase
    .from('point_transactions')
    .select('amount, type')
    .eq('user_id', user.id)

  if (!data || data.length === 0) return 0

  const balance = data.reduce((sum, tx) => {
    return sum + (tx.type === 'earn' ? tx.amount : -tx.amount)
  }, 0)

  return Math.max(0, balance)
}

export async function getUserPointHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}
