'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/shared/lib/auth/admin'
import type { EventItem } from './get-events'

type ActionResult = { success: true } | { success: false; error: string }

async function uploadEventImage(
  supabase: ReturnType<typeof createAdminClient>,
  file: File
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

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

export async function createEvent(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()

    const title = (formData.get('title') as string || '').trim()
    if (!title) return { success: false, error: '제목을 입력해주세요.' }

    let imageUrl: string | null = null
    const file = formData.get('file') as File | null
    if (file && file.size > 0) {
      const result = await uploadEventImage(supabase, file)
      if (!result.success) return result
      imageUrl = result.url
    }

    const couponCode = (formData.get('coupon_code') as string || '').trim().toUpperCase() || null
    const { error } = await supabase.from('events').insert({
      title,
      content: (formData.get('content') as string || '').trim() || null,
      image_url: imageUrl,
      link_url: (formData.get('link_url') as string || '').trim() || null,
      coupon_code: couponCode,
      discount_type: couponCode ? ((formData.get('discount_type') as string) || 'percent') : null,
      discount_value: couponCode ? (parseFloat(formData.get('discount_value') as string) || 0) : 0,
      min_order_amount: parseFloat(formData.get('min_order_amount') as string) || 0,
      single_use: formData.get('single_use') === 'true',
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      starts_at: (formData.get('starts_at') as string) || null,
      ends_at: (formData.get('ends_at') as string) || null,
      is_active: true,
    })

    if (error) return { success: false, error: `등록 실패: ${error.message}` }

    revalidatePath('/admin/events')
    revalidatePath('/community/event')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateEvent(
  id: string,
  data: Partial<Pick<EventItem, 'title' | 'content' | 'link_url' | 'coupon_code' | 'discount_type' | 'discount_value' | 'min_order_amount' | 'single_use' | 'sort_order' | 'is_active' | 'starts_at' | 'ends_at'>>
): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('events').update(data).eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/events')
    revalidatePath('/community/event')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/events')
    revalidatePath('/community/event')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAllEvents(): Promise<EventItem[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch {
    return []
  }
}
