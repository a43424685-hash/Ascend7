'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export type SiteSettings = {
  site_name: string
  site_description: string
  logo_url: string
  favicon_url: string
  og_image_url: string
}

const DEFAULTS: SiteSettings = {
  site_name: 'ASCEND7',
  site_description: '고성능 트레이닝을 위한 프리미엄 짐웨어 브랜드',
  logo_url: '',
  favicon_url: '',
  og_image_url: '',
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', Object.keys(DEFAULTS))

    if (error || !data) return DEFAULTS

    const settings = { ...DEFAULTS }
    for (const row of data) {
      const key = row.key as keyof SiteSettings
      if (key in settings) {
        settings[key] = typeof row.value === 'string' ? row.value : JSON.stringify(row.value)
      }
    }
    return settings
  } catch {
    return DEFAULTS
  }
}
