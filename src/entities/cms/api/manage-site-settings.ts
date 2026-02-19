'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidateTag } from 'next/cache'

type ActionResult = { success: true } | { success: false; error: string }

const PUBLIC_KEYS = ['site_name', 'site_description', 'logo_url', 'favicon_url', 'og_image_url', 'shipping_policy']

export async function updateSiteSetting(key: string, value: string): Promise<ActionResult> {
  try {
    if (!PUBLIC_KEYS.includes(key)) {
      return { success: false, error: `허용되지 않는 설정 키: ${key}` }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value: JSON.parse(JSON.stringify(value)),
        is_public: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })

    if (error) return { success: false, error: `설정 저장 실패: ${error.message}` }

    revalidateTag('site-settings')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '설정 저장 중 오류' }
  }
}

export async function updateSiteSettings(settings: Record<string, string>): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const rows = Object.entries(settings)
      .filter(([key]) => PUBLIC_KEYS.includes(key))
      .map(([key, value]) => ({
        key,
        value: JSON.parse(JSON.stringify(value)),
        is_public: true,
        updated_at: new Date().toISOString(),
      }))

    if (rows.length === 0) return { success: false, error: '저장할 설정이 없습니다' }

    const { error } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' })

    if (error) return { success: false, error: `설정 저장 실패: ${error.message}` }

    revalidateTag('site-settings')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '설정 저장 중 오류' }
  }
}

export async function uploadSiteImage(formData: FormData): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const supabase = createAdminClient()
    const file = formData.get('file') as File | null
    const purpose = formData.get('purpose') as string || 'general'

    if (!file || file.size === 0) return { success: false, error: '파일을 선택해주세요' }
    if (file.size > 5 * 1024 * 1024) return { success: false, error: '파일 크기는 5MB 이하여야 합니다' }

    const ext = file.name.split('.').pop()
    const fileName = `site/${purpose}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, { contentType: file.type, upsert: true })

    if (uploadError) return { success: false, error: `업로드 실패: ${uploadError.message}` }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '업로드 중 오류' }
  }
}
