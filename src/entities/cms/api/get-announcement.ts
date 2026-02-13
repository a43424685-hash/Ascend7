'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export type Announcement = {
  id: string
  text_ko: string
  text_en: string | null
  link_url: string | null
  theme: 'dark' | 'light' | 'brand' | 'accent'
  is_active: boolean
  start_at: string | null
  end_at: string | null
  sort_order: number
  created_at: string
}

export async function getActiveAnnouncement(): Promise<Announcement | null> {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('announcement_bar')
      .select('*')
      .eq('is_active', true)
      .or(`start_at.is.null,start_at.lte.${now}`)
      .or(`end_at.is.null,end_at.gte.${now}`)
      .limit(1)
      .single()

    if (error || !data) return null
    return data as Announcement
  } catch {
    return null
  }
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('announcement_bar')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return []
    return data as Announcement[]
  } catch {
    return []
  }
}
