'use server'

import { getSupabaseClient } from '@/shared/api/supabaseClient'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function uploadProductImage(formData: FormData) {
  const file = formData.get('file') as File
  const productId = formData.get('productId') as string
  const sortOrder = parseInt(formData.get('sortOrder') as string) || 0

  if (!file || !productId) {
    throw new Error('File and product ID are required')
  }

  // Supabase Storage에 업로드
  const supabase = createAdminClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${productId}/${Date.now()}.${fileExt}`

  // ArrayBuffer로 변환
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  // Public URL 가져오기
  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(fileName)

  // DB에 이미지 정보 저장
  const { error: dbError } = await supabase.from('product_images').insert({
    product_id: productId,
    url: publicUrl,
    sort_order: sortOrder,
  })

  if (dbError) {
    // DB 저장 실패 시 업로드된 파일 삭제
    await supabase.storage.from('product-images').remove([fileName])
    throw new Error(`Failed to save image info: ${dbError.message}`)
  }

  revalidatePath(`/admin/products/${productId}`)
  revalidatePath(`/product/${productId}`)
}

export async function deleteProductImage(imageId: string, productId: string) {
  const supabase = createAdminClient()

  // 이미지 URL 가져오기
  const { data: image } = await supabase
    .from('product_images')
    .select('url')
    .eq('id', imageId)
    .single()

  if (!image) {
    throw new Error('Image not found')
  }

  // Storage에서 파일 삭제
  const fileName = image.url.split('/product-images/')[1]
  if (fileName) {
    await supabase.storage.from('product-images').remove([fileName])
  }

  // DB에서 이미지 정보 삭제
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }

  revalidatePath(`/admin/products/${productId}`)
  revalidatePath(`/product/${productId}`)
}

