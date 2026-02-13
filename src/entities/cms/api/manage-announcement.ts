'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { revalidateTag } from 'next/cache'

type ActionResult = { success: true } | { success: false; error: string }

export async function createAnnouncement(data: {
  text_ko: string
  text_en?: string
  link_url?: string
  theme?: string
  start_at?: string | null
  end_at?: string | null
}): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    // 새 공지 생성 시 is_active=false로 (활성은 별도 토글)
    const { error } = await supabase.from('announcement_bar').insert({
      text_ko: data.text_ko,
      text_en: data.text_en || '',
      link_url: data.link_url || null,
      theme: data.theme || 'dark',
      is_active: false,
      start_at: data.start_at || null,
      end_at: data.end_at || null,
    })

    if (error) return { success: false, error: `공지 생성 실패: ${error.message}` }

    revalidateTag('announcement')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '공지 생성 중 오류' }
  }
}

export async function updateAnnouncement(id: string, data: {
  text_ko?: string
  text_en?: string
  link_url?: string | null
  theme?: string
  start_at?: string | null
  end_at?: string | null
}): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('announcement_bar')
      .update(data)
      .eq('id', id)

    if (error) return { success: false, error: `공지 수정 실패: ${error.message}` }

    revalidateTag('announcement')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '공지 수정 중 오류' }
  }
}

export async function toggleAnnouncement(id: string, activate: boolean): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    if (activate) {
      // 다른 활성 공지 비활성화 (1개만 활성 허용)
      await supabase
        .from('announcement_bar')
        .update({ is_active: false })
        .eq('is_active', true)
    }

    const { error } = await supabase
      .from('announcement_bar')
      .update({ is_active: activate })
      .eq('id', id)

    if (error) return { success: false, error: `상태 변경 실패: ${error.message}` }

    revalidateTag('announcement')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '상태 변경 중 오류' }
  }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('announcement_bar')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: `공지 삭제 실패: ${error.message}` }

    revalidateTag('announcement')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '공지 삭제 중 오류' }
  }
}
