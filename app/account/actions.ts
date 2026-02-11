'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProfileData = {
  name: string | null
  phone: string | null
  email: string
}

/**
 * 현재 사용자의 프로필 조회
 */
export async function getProfile(): Promise<ProfileData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, phone, email')
    .eq('id', user.id)
    .single()

  return profile || { name: null, phone: null, email: user.email || '' }
}

/**
 * 프로필 업데이트 Server Action
 */
export async function updateProfile(
  prevState: any,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      name: name || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return { error: '프로필 업데이트에 실패했습니다.' }
  }

  revalidatePath('/account')
  return { success: true }
}
