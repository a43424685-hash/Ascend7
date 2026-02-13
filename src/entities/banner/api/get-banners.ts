'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export type CtaButton = {
  text: string
  url: string
  style: 'primary' | 'outline'
}

export type HeroBanner = {
  id: string
  title: string
  title_en: string | null
  subtitle: string | null
  subtitle_en: string | null
  image_url: string
  image_mobile_url: string | null
  link_url: string | null
  link_text: string | null
  cta_buttons: CtaButton[]
  is_active: boolean
  sort_order: number
  start_at: string | null
  end_at: string | null
  created_at: string
}

export async function getActiveBanners(): Promise<HeroBanner[]> {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .or(`start_at.is.null,start_at.lte.${now}`)
      .or(`end_at.is.null,end_at.gte.${now}`)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch banners:', error)
      return []
    }

    return (data || []).map(normalizeBanner)
  } catch {
    return []
  }
}

export async function getAllBanners(): Promise<HeroBanner[]> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch banners:', error)
      return []
    }

    return (data || []).map(normalizeBanner)
  } catch {
    return []
  }
}

// DB에서 가져온 cta_buttons를 안전하게 파싱
function normalizeBanner(row: Record<string, unknown>): HeroBanner {
  let ctaButtons: CtaButton[] = []
  try {
    const raw = row.cta_buttons
    if (Array.isArray(raw)) ctaButtons = raw as CtaButton[]
    else if (typeof raw === 'string') ctaButtons = JSON.parse(raw)
  } catch { /* ignore */ }

  return {
    ...(row as unknown as HeroBanner),
    cta_buttons: ctaButtons,
  }
}
