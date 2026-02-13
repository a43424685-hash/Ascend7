'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export async function uploadCmsImage(formData: FormData): Promise<string> {
  const file = formData.get('file') as File
  const prefix = (formData.get('prefix') as string) || 'sections'

  if (!file || file.size === 0) {
    throw new Error('파일을 선택해주세요')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('파일 크기는 5MB 이하여야 합니다')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드 가능합니다')
  }

  const supabase = createAdminClient()
  const ext = file.name.split('.').pop()
  const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) {
    throw new Error(`이미지 업로드 실패: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return publicUrl
}
