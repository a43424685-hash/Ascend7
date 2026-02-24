'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ProfileData = {
  display_name: string | null
  phone: string | null
  email: string
  birthday: string | null
  // 기본 배송지 정보
  default_address: string | null
  default_address_detail: string | null
  default_postal_code: string | null
  default_memo: string | null
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
    .select('display_name, phone, email, birthday, default_address, default_address_detail, default_postal_code, default_memo')
    .eq('id', user.id)
    .single()

  return profile || {
    display_name: null,
    phone: null,
    email: user.email || '',
    birthday: null,
    default_address: null,
    default_address_detail: null,
    default_postal_code: null,
    default_memo: null,
  }
}

/**
 * 프로필 업데이트 Server Action
 */
export async function updateProfile(
  prevState: any,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const displayName = formData.get('display_name') as string
  const phone = formData.get('phone') as string
  const birthday = formData.get('birthday') as string
  const defaultAddress = formData.get('default_address') as string
  const defaultAddressDetail = formData.get('default_address_detail') as string
  const defaultPostalCode = formData.get('default_postal_code') as string
  const defaultMemo = formData.get('default_memo') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName || null,
      phone: phone || null,
      birthday: birthday || null,
      default_address: defaultAddress || null,
      default_address_detail: defaultAddressDetail || null,
      default_postal_code: defaultPostalCode || null,
      default_memo: defaultMemo || null,
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

/**
 * 비밀번호 변경
 */
export async function changePassword(
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { error: '비밀번호는 6자 이상이어야 합니다.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error('Password change error:', error)
    return { error: '비밀번호 변경에 실패했습니다. ' + error.message }
  }

  return { success: true }
}
