'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export async function uploadDetailImage(formData: FormData): Promise<string> {
  const file = formData.get('file') as File
  const productId = formData.get('productId') as string

  if (!file || !productId) {
    throw new Error('File and product ID are required')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('파일 크기는 5MB 이하여야 합니다')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드 가능합니다')
  }

  const supabase = createAdminClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${productId}/detail-${Date.now()}.${fileExt}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`업로드 실패: ${uploadError.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(fileName)

  return publicUrl
}
