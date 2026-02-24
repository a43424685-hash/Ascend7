import { getSupabaseClient } from '@/shared/api/supabaseClient'

/** 준비중(is_coming_soon) 상품의 slug 목록만 가볍게 조회 */
export async function getComingSoonSlugs(): Promise<string[]> {
  const supabase = await getSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('is_coming_soon', true)
    .eq('is_active', true)

  return (data ?? []).map((p) => p.slug)
}
