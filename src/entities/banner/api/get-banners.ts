'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export type HeroBanner = {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  link_url: string | null
  link_text: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export async function getActiveBanners(): Promise<HeroBanner[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to fetch banners:', error)
    return []
  }

  return data as HeroBanner[]
}

export async function getAllBanners(): Promise<HeroBanner[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to fetch banners:', error)
    return []
  }

  return data as HeroBanner[]
}
