import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/shared/lib/auth/admin'
import { getSiteSettings } from '@/entities/cms/api/get-site-settings'
import { getAllAnnouncements } from '@/entities/cms/api/get-announcement'
import { SiteSettingsForm, ShippingPolicyForm } from '@/widgets/admin/site-settings-form'
import { AnnouncementManager } from '@/widgets/admin/announcement-manager'

export const dynamic = 'force-dynamic'

export default async function AdminSitePage() {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) redirect('/')

  const [settings, announcements] = await Promise.all([
    getSiteSettings(),
    getAllAnnouncements(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1">사이트 설정</h1>
        <p className="text-xs sm:text-sm text-gray-500">브랜딩, 로고, 공지 바 등 전역 설정을 관리합니다.</p>
      </div>

      <SiteSettingsForm settings={settings} />
      <ShippingPolicyForm settings={settings} />
      <AnnouncementManager announcements={announcements} />
    </div>
  )
}
