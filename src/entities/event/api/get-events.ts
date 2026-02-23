import { getSupabaseClient } from '@/shared/api/supabaseClient'

export interface EventItem {
  id: string
  title: string
  content: string | null
  image_url: string | null
  link_url: string | null
  coupon_code: string | null
  discount_type: 'percent' | 'amount' | null
  discount_value: number
  min_order_amount: number
  single_use: boolean
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  sort_order: number
  created_at: string
}

export async function getActiveEvents(): Promise<EventItem[]> {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch {
    return []
  }
}
