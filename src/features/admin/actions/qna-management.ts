'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import { requireAdmin } from '@/shared/lib/auth/admin'

export async function answerQna(qnaId: string, answer: string) {
  try {
    const user = await requireAdmin()
    if (!answer?.trim()) return { success: false, error: '답변 내용을 입력해주세요.' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('qna')
      .update({
        answer: answer.trim(),
        answered_at: new Date().toISOString(),
        answered_by: user.id,
      })
      .eq('id', qnaId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/qna')
    revalidatePath('/community/qna')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteQnaAnswer(qnaId: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('qna')
      .update({ answer: null, answered_at: null, answered_by: null })
      .eq('id', qnaId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/qna')
    revalidatePath('/community/qna')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleQnaActive(qnaId: string, isActive: boolean) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase
      .from('qna')
      .update({ is_active: isActive })
      .eq('id', qnaId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/qna')
    revalidatePath('/community/qna')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteQna(qnaId: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { error } = await supabase.from('qna').delete().eq('id', qnaId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/qna')
    revalidatePath('/community/qna')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
