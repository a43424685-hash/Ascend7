'use server'

import { createClient } from '@/shared/lib/supabase/server'

export interface ShippingInfo {
  name: string
  phone: string
  address: string
  addressDetail: string
  postalCode: string
  memo: string
}

export async function getDefaultShippingInfo(): Promise<ShippingInfo | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, phone, default_address, default_address_detail, default_postal_code, default_memo')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // 기본 배송지가 설정되어 있는 경우에만 반환
  if (!profile.default_address && !profile.name) return null

  return {
    name: profile.name || '',
    phone: profile.phone || '',
    address: profile.default_address || '',
    addressDetail: profile.default_address_detail || '',
    postalCode: profile.default_postal_code || '',
    memo: profile.default_memo || '',
  }
}

export async function saveDefaultShippingInfo(info: ShippingInfo): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '로그인이 필요합니다' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      name: info.name,
      phone: info.phone,
      default_address: info.address,
      default_address_detail: info.addressDetail,
      default_postal_code: info.postalCode,
      default_memo: info.memo,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to save shipping info:', error)
    return { success: false, error: '배송지 저장에 실패했습니다' }
  }

  return { success: true }
}
