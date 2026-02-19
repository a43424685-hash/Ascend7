import { getSupabaseClient } from '@/shared/api/supabaseClient'

export interface QnaItem {
  id: string
  product_id: string | null
  user_id: string
  title: string
  content: string
  is_secret: boolean
  answer: string | null
  answered_at: string | null
  is_active: boolean
  created_at: string
  product: { id: string; name: string; slug: string } | null
  author: { display_name: string | null } | null
}

export async function getQnaList(): Promise<QnaItem[]> {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from('qna')
      .select(`
        *,
        product:products!product_id(id, name, slug),
        author:profiles!user_id(display_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as unknown as QnaItem[]
  } catch {
    return []
  }
}
