import { getSiteSettings } from '@/entities/cms/api/get-site-settings'
import { ShippingPolicyForm } from '@/widgets/admin/site-settings-form'

export const dynamic = 'force-dynamic'

export default async function AdminShippingPage() {
  const settings = await getSiteSettings()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">배송 / 교환 / 반품 안내</h1>
        <p className="text-sm text-gray-500 mt-1">모든 상품 페이지의 안내 탭에 동일하게 표시됩니다.</p>
      </div>

      <ShippingPolicyForm settings={settings} />
    </div>
  )
}
