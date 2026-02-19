import { getSupabaseClient } from '@/shared/api/supabaseClient'

export type ReviewSortBy = 'newest' | 'best'

export interface ReviewWithDetails {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string | null
  content: string
  is_active: boolean
  created_at: string
  product: {
    id: string
    name: string
    slug: string
    images: Array<{ url: string; sort_order: number }>
  } | null
  reviewer: { display_name: string | null } | null
}

export async function getReviews(sortBy: ReviewSortBy = 'newest'): Promise<ReviewWithDetails[]> {
  try {
    const supabase = await getSupabaseClient()

    let query = supabase
      .from('reviews')
      .select(`
        *,
        product:products!product_id(id, name, slug, images:product_images(url, sort_order)),
        reviewer:profiles!user_id(display_name)
      `)
      .eq('is_active', true)

    if (sortBy === 'best') {
      query = query.order('rating', { ascending: false }).order('created_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as unknown as ReviewWithDetails[]
  } catch {
    return []
  }
}

export async function getReviewStats(): Promise<{ count: number; average: number }> {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('is_active', true)

    if (error || !data) return { count: 0, average: 0 }
    const count = data.length
    const average = count > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / count : 0
    return { count, average: Math.round(average * 10) / 10 }
  } catch {
    return { count: 0, average: 0 }
  }
}
