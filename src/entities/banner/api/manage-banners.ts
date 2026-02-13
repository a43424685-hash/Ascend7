'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'

type ActionResult = { success: true } | { success: false; error: string }

export async function createBanner(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const file = formData.get('file') as File | null
    const mobileFile = formData.get('mobileFile') as File | null
    const title = formData.get('title') as string || ''
    const titleEn = formData.get('titleEn') as string || ''
    const subtitle = formData.get('subtitle') as string || ''
    const subtitleEn = formData.get('subtitleEn') as string || ''
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0
    const startAt = formData.get('startAt') as string || null
    const endAt = formData.get('endAt') as string || null
    const ctaButtonsRaw = formData.get('ctaButtons') as string || '[]'

    let ctaButtons = []
    try { ctaButtons = JSON.parse(ctaButtonsRaw) } catch { /* ignore */ }

    // 데스크탑 이미지 업로드
    let imageUrl = ''
    if (file && file.size > 0) {
      const result = await uploadBannerImage(supabase, file, 'desktop')
      if (!result.success) return result
      imageUrl = result.url
    } else {
      return { success: false, error: '배너 이미지를 선택해주세요' }
    }

    // 모바일 이미지 업로드 (선택)
    let imageMobileUrl: string | null = null
    if (mobileFile && mobileFile.size > 0) {
      const result = await uploadBannerImage(supabase, mobileFile, 'mobile')
      if (!result.success) return result
      imageMobileUrl = result.url
    }

    const { error } = await supabase.from('hero_banners').insert({
      title,
      title_en: titleEn,
      subtitle,
      subtitle_en: subtitleEn,
      image_url: imageUrl,
      image_mobile_url: imageMobileUrl,
      cta_buttons: ctaButtons,
      sort_order: sortOrder,
      start_at: startAt || null,
      end_at: endAt || null,
      is_active: true,
    })

    if (error) {
      return { success: false, error: `배너 생성 실패: ${error.message}` }
    }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    revalidateTag('banners')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '배너 생성 중 오류 발생' }
  }
}

async function uploadBannerImage(
  supabase: ReturnType<typeof createAdminClient>,
  file: File,
  suffix: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const ext = file.name.split('.').pop()
  const fileName = `banners/${Date.now()}-${suffix}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) return { success: false, error: `이미지 업로드 실패: ${error.message}` }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return { success: true, url: publicUrl }
}

export async function updateBanner(id: string, data: {
  title?: string
  title_en?: string
  subtitle?: string
  subtitle_en?: string
  image_mobile_url?: string | null
  cta_buttons?: Array<{ text: string; url: string; style: string }>
  link_url?: string
  link_text?: string
  is_active?: boolean
  sort_order?: number
  start_at?: string | null
  end_at?: string | null
}): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('hero_banners')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { success: false, error: `배너 수정 실패: ${error.message}` }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    revalidateTag('banners')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '배너 수정 중 오류 발생' }
  }
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const { data: banner } = await supabase
      .from('hero_banners')
      .select('image_url, image_mobile_url')
      .eq('id', id)
      .single()

    // 스토리지에서 이미지 삭제
    const filesToRemove: string[] = []
    for (const url of [banner?.image_url, banner?.image_mobile_url]) {
      if (url?.includes('/product-images/')) {
        const fileName = url.split('/product-images/')[1]
        if (fileName) filesToRemove.push(fileName)
      }
    }
    if (filesToRemove.length > 0) {
      await supabase.storage.from('product-images').remove(filesToRemove)
    }

    const { error } = await supabase
      .from('hero_banners')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: `배너 삭제 실패: ${error.message}` }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    revalidateTag('banners')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '배너 삭제 중 오류 발생' }
  }
}
