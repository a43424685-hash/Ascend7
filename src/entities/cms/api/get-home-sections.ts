'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { HOME_DEFAULTS } from '@/entities/cms/types/home-sections'
import type { BrandValue, BrandValuesSection, PhilosophyData, BottomCtaData } from '@/entities/cms/types/home-sections'

export async function getHomeSections() {
  try {
    const supabase = createAdminClient()

    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['home_brand_values', 'home_philosophy', 'home_bottom_cta'])

    const settings: Record<string, unknown> = {}
    if (data) {
      for (const row of data) settings[row.key] = row.value
    }

    // brand_values: 하위호환 - 배열이면 { items: [...] } 로 래핑
    const rawBV = settings.home_brand_values
    let brandValues: BrandValuesSection
    if (Array.isArray(rawBV)) {
      brandValues = { items: rawBV as BrandValue[] }
    } else if (rawBV && typeof rawBV === 'object' && 'items' in (rawBV as Record<string, unknown>)) {
      brandValues = rawBV as BrandValuesSection
    } else {
      brandValues = HOME_DEFAULTS.brand_values
    }

    return {
      brandValues,
      philosophy: (settings.home_philosophy || HOME_DEFAULTS.philosophy) as PhilosophyData,
      bottomCta: (settings.home_bottom_cta || HOME_DEFAULTS.bottom_cta) as BottomCtaData,
    }
  } catch {
    return {
      brandValues: HOME_DEFAULTS.brand_values,
      philosophy: HOME_DEFAULTS.philosophy,
      bottomCta: HOME_DEFAULTS.bottom_cta,
    }
  }
}

export async function getHomeSectionByKey(key: string) {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single()
    return data?.value ?? null
  } catch {
    return null
  }
}
