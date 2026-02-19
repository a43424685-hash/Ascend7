'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/shared/lib/auth/admin'
import type { LookbookItem } from './get-lookbook'

type ActionResult = { success: true } | { success: false; error: string }

async function uploadLookbookImage(
  supabase: ReturnType<typeof createAdminClient>,
  file: File
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `lookbook/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, arrayBuffer, { contentType: file.type, upsert: false })

  if (error) return { success: false, error: `이미지 업로드 실패: ${error.message}` }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename)

  return { success: true, url: publicUrl }
}

export async function createLookbookItem(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()

    const file = formData.get('file') as File | null
    if (!file || file.size === 0) return { success: false, error: '이미지를 선택해주세요.' }

    const uploadResult = await uploadLookbookImage(supabase, file)
    if (!uploadResult.success) return uploadResult

    const tagsRaw = (formData.get('tags') as string || '').trim()
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

    const { error } = await supabase.from('lookbook').insert({
      title: (formData.get('title') as string || '').trim(),
      description: (formData.get('description') as string || '').trim() || null,
      image_url: uploadResult.url,
      link_url: (formData.get('link_url') as string || '').trim() || null,
      tags,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      is_active: true,
    })

    if (error) return { success: false, error: `등록 실패: ${error.message}` }

    revalidatePath('/admin/lookbook')
    revalidatePath('/community/lookbook')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateLookbookItem(
  id: string,
  data: Partial<Pick<LookbookItem, 'title' | 'description' | 'link_url' | 'tags' | 'sort_order' | 'is_active'>>
): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('lookbook').update(data).eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/lookbook')
    revalidatePath('/community/lookbook')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteLookbookItem(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('lookbook').delete().eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/lookbook')
    revalidatePath('/community/lookbook')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAllLookbookItems(): Promise<LookbookItem[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('lookbook')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch {
    return []
  }
}
