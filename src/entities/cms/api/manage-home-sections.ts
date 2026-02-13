'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { BrandValue, PhilosophyData, BottomCtaData } from '@/entities/cms/types/home-sections'

type ActionResult = { success: true } | { success: false; error: string }

async function upsertSetting(key: string, value: unknown): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { key, value, is_public: true },
        { onConflict: 'key' }
      )

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '저장 실패' }
  }
}

export async function updateBrandValues(values: BrandValue[]): Promise<ActionResult> {
  return upsertSetting('home_brand_values', values)
}

export async function updatePhilosophy(data: PhilosophyData): Promise<ActionResult> {
  return upsertSetting('home_philosophy', data)
}

export async function updateBottomCta(data: BottomCtaData): Promise<ActionResult> {
  return upsertSetting('home_bottom_cta', data)
}
