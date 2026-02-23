import { getActiveAnnouncements } from '@/entities/cms/api/get-announcement'
import { getActiveEvents } from '@/entities/event/api/get-events'
import { SlidingAnnouncementBar } from './index'

export async function AnnouncementBarServer() {
  const [announcements, events] = await Promise.all([
    getActiveAnnouncements(),
    getActiveEvents(),
  ])

  const now = new Date()

  // 현재 날짜 범위 내 활성 이벤트 중 쿠폰이 있는 것만 배너 슬라이드로 추가
  const eventSlides = events
    .filter(e => {
      if (!e.coupon_code) return false
      const start = e.starts_at ? new Date(e.starts_at) : null
      const end = e.ends_at ? new Date(e.ends_at) : null
      if (start && now < start) return false
      if (end && now > end) return false
      return true
    })
    .map(e => {
      let text = ''
      if (e.discount_type === 'percent' && e.discount_value > 0) {
        text = `🎁 ${e.title} ${e.discount_value}% 할인! 코드: ${e.coupon_code}`
      } else if (e.discount_type === 'amount' && e.discount_value > 0) {
        text = `🎁 ${e.title} ${Number(e.discount_value).toLocaleString()}원 할인! 코드: ${e.coupon_code}`
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

  // 이벤트 슬라이드를 맨 앞에 배치
  const allSlides = [...eventSlides, ...announcements]

  return <SlidingAnnouncementBar slides={allSlides} />
}
