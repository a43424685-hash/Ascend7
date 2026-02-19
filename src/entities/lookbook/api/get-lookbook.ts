import { getSupabaseClient } from '@/shared/api/supabaseClient'

export interface LookbookItem {
  id: string
  title: string
  description: string | null
  image_url: string
  link_url: string | null
  tags: string[]
  is_active: boolean
  sort_order: number
  created_at: string
}

export async function getLookbookItems(): Promise<LookbookItem[]> {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from('lookbook')
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
