import { getActiveAnnouncements } from '@/entities/cms/api/get-announcement'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { SlidingAnnouncementBar, DEFAULT_SLIDES } from './index'

export async function AnnouncementBarServer() {
  const supabase = createAdminClient()

  const [announcements, eventsResult] = await Promise.all([
    getActiveAnnouncements(),
    supabase
      .from('events')
      .select('id, title, coupon_code, discount_type, discount_value, starts_at, ends_at, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  const events = eventsResult.data || []

  // 쿠폰이 있는 활성 이벤트를 배너 슬라이드로 변환
  const eventSlides = events
    .filter(e => !!e.coupon_code)
    .map(e => {
      const dv = Number(e.discount_value) || 0
      let text = ''
      if (e.discount_type === 'percent' && dv > 0) {
        text = `🎁 ${e.title} ${dv}% 할인! 코드: ${e.coupon_code}`
      } else if (e.discount_type === 'amount' && dv > 0) {
        text = `🎁 ${e.title} ${dv.toLocaleString()}원 할인! 코드: ${e.coupon_code}`
      } else {
        text = `🎁 ${e.title} 코드: ${e.coupon_code}`
      }
      return {
        id: `event_${e.id}`,
        text_ko: text,
        link_url: '/community/event',
        theme: 'dark' as const,
        text_en: null,
        is_active: true,
        start_at: null,
        end_at: null,
        sort_order: -1,
        created_at: e.created_at,
      }
    })

  // 이벤트 슬라이드를 맨 앞에, DB 공지가 없으면 기본 슬라이드 사용
  const baseSlides = announcements.length > 0 ? announcements : DEFAULT_SLIDES
  const allSlides = [...eventSlides, ...baseSlides]

  return <SlidingAnnouncementBar slides={allSlides} />
}
