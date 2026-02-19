'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

export type SiteSettings = {
  site_name: string
  site_description: string
  logo_url: string
  favicon_url: string
  og_image_url: string
  shipping_policy: string
}

const DEFAULTS: SiteSettings = {
  site_name: 'ASCEND7',
  site_description: '고성능 트레이닝을 위한 프리미엄 짐웨어 브랜드',
  logo_url: '',
  favicon_url: '',
  og_image_url: '',
  shipping_policy: '택배 배송 (CJ대한통운)\n배송비: 3,000원 (50,000원 이상 무료배송)\n출고: 결제 완료 후 1~3 영업일 이내\n\n교환: 상품 수령 후 7일 이내\n반품: 상품 수령 후 7일 이내\n반품 배송비: 고객 변심 왕복 6,000원 / 불량 무료\n환불: 반품 수령 후 3~5 영업일\n\n* 착용 흔적, 택(Tag) 제거, 세탁/수선한 경우 교환·반품 불가',
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', Object.keys(DEFAULTS))

    if (error || !data) return DEFAULTS

    const settings = { ...DEFAULTS }
    for (const row of data) {
      const key = row.key as keyof SiteSettings
      if (key in settings) {
        settings[key] = typeof row.value === 'string' ? row.value : JSON.stringify(row.value)
      }
    }
    return settings
  } catch {
    return DEFAULTS
  }
}
