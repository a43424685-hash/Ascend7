'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createQnaAction(prevState: { error: string } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/community/qna/write')
  }

  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const product_id = (formData.get('product_id') as string) || null
  const is_secret = formData.get('is_secret') === 'on'

  if (!title) return { error: '제목을 입력해주세요.' }
  if (!content) return { error: '내용을 입력해주세요.' }

  const { error } = await supabase.from('qna').insert({
    user_id: user.id,
    product_id: product_id || null,
    title,
    content,
    is_secret,
  })

  if (error) return { error: '문의 등록에 실패했습니다. 다시 시도해주세요.' }

  revalidatePath('/community/qna')
  redirect('/community/qna')
}
