import { getActiveAnnouncements } from '@/entities/cms/api/get-announcement'
import { SlidingAnnouncementBar } from './index'

export async function AnnouncementBarServer() {
  const announcements = await getActiveAnnouncements()
  // DB에 데이터가 있으면 사용, 없으면 컴포넌트 내 기본 슬라이드 4개 표시
  return <SlidingAnnouncementBar slides={announcements} />
}
