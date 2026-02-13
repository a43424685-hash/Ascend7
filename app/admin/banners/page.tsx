import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/shared/lib/auth/admin'
import { getAllBanners } from '@/entities/banner/api/get-banners'
import { BannerManager } from '@/widgets/admin/banner-manager'

export const dynamic = 'force-dynamic'

export default async function AdminBannersPage() {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) redirect('/')

  const banners = await getAllBanners()

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">배너 관리</h1>
        <p className="text-xs sm:text-sm text-gray-500">홈페이지 히어로 슬라이드 배너를 관리합니다. 이미지, 텍스트, 링크를 설정할 수 있습니다.</p>
      </div>
      <BannerManager banners={banners} />
    </div>
  )
}
