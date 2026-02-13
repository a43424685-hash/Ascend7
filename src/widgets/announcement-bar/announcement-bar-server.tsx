import { getActiveAnnouncement } from '@/entities/cms/api/get-announcement'
import { AnnouncementBar } from './index'

export async function AnnouncementBarServer() {
  const announcement = await getActiveAnnouncement()

  if (!announcement) return null

  return (
    <AnnouncementBar
      text={announcement.text_ko}
      linkUrl={announcement.link_url}
      theme={announcement.theme}
    />
  )
}
