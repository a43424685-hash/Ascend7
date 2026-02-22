import { createAdminClient } from '@/shared/lib/supabase/admin'

async function getRestockAlerts() {
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase
    .from('restock_alerts')
    .select(
      `
      id,
      email,
      notified_at,
      created_at,
      variants (
        color,
        size,
        stock,
        products ( name, slug )
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(200)
  return data || []
}

export default async function RestockAlertsPage() {
  const alerts = await getRestockAlerts()
  const pending = alerts.filter((a) => !a.notified_at)
  const notified = alerts.filter((a) => a.notified_at)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">재입고 알림 신청</h1>

      <div className="mb-4 flex gap-4 text-sm">
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 font-medium">
          대기 {pending.length}건
        </span>
        <span className="bg-gray-100 text-gray-600 px-3 py-1">
          발송 완료 {notified.length}건
        </span>
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">상품</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">옵션</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">현재 재고</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">신청 이메일</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">신청일</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  재입고 알림 신청 내역이 없습니다.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => {
                const variant = alert.variants as any
                const product = variant?.products as any
                return (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{product?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {variant ? `${variant.color} / ${variant.size}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={variant?.stock > 0 ? 'text-green-600 font-medium' : 'text-red-500'}>
                        {variant?.stock ?? '-'}개
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{alert.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(alert.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      {alert.notified_at ? (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500">
                          발송 완료
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 font-medium">
                          대기 중
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pending.length > 0 && (
        <p className="mt-4 text-xs text-gray-400">
          * 재고가 보충되면 해당 고객에게 이메일 발송 후 notified_at을 업데이트하세요.
        </p>
      )}
    </div>
  )
}
