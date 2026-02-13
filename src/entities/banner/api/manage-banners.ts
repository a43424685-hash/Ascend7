'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createBanner(formData: FormData) {
  const supabase = createAdminClient()

  const file = formData.get('file') as File | null
  const title = formData.get('title') as string || ''
  const subtitle = formData.get('subtitle') as string || ''
  const linkUrl = formData.get('linkUrl') as string || '/shop'
  const linkText = formData.get('linkText') as string || 'SHOP NOW'
  const sortOrder = parseInt(formData.get('sortOrder') as string) || 0

  let imageUrl = ''

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `banners/${Date.now()}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`이미지 업로드 실패: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    imageUrl = publicUrl
  } else {
    const urlFromForm = formData.get('imageUrl') as string
    if (!urlFromForm) throw new Error('이미지를 업로드하거나 URL을 입력해주세요')
    imageUrl = urlFromForm
  }

  const { error } = await supabase.from('hero_banners').insert({
    title,
    subtitle,
    image_url: imageUrl,
    link_url: linkUrl,
    link_text: linkText,
    sort_order: sortOrder,
    is_active: true,
  })

  if (error) throw new Error(`배너 생성 실패: ${error.message}`)

  revalidatePath('/')
  revalidatePath('/admin/banners')
}

export async function updateBanner(id: string, data: {
  title?: string
  subtitle?: string
  link_url?: string
  link_text?: string
  is_active?: boolean
  sort_order?: number
}) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('hero_banners')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`배너 수정 실패: ${error.message}`)

  revalidatePath('/')
  revalidatePath('/admin/banners')
}

export async function deleteBanner(id: string) {
  const supabase = createAdminClient()

  const { data: banner } = await supabase
    .from('hero_banners')
    .select('image_url')
    .eq('id', id)
    .single()

  if (banner?.image_url?.includes('/product-images/')) {
    const fileName = banner.image_url.split('/product-images/')[1]
    if (fileName) {
      await supabase.storage.from('product-images').remove([fileName])
    }
  }

  const { error } = await supabase
    .from('hero_banners')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`배너 삭제 실패: ${error.message}`)

  revalidatePath('/')
  revalidatePath('/admin/banners')
}
