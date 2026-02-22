import { createAdminClient } from '@/shared/lib/supabase/admin'
import Link from 'next/link'
import { formatPrice } from '@/shared/lib/utils'
import { toggleCoupon } from '@/features/coupon/actions/create-coupon'

async function getCoupons() {
  const adminSupabase = createAdminClient()
  const { data } = await adminSupabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function CouponsPage() {
  const coupons = await getCoupons()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">쿠폰 관리</h1>
        <Link href="/admin/coupons/new">
          <button className="px-4 py-2 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
            + 쿠폰 생성
          </button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">코드</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">할인</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">최소주문</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">사용/제한</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">만료일</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  등록된 쿠폰이 없습니다.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold tracking-wider">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.type === 'percentage'
                      ? `${coupon.value}%${coupon.max_discount_amount ? ` (최대 ${formatPrice(coupon.max_discount_amount)})` : ''}`
                      : formatPrice(coupon.value)}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.min_order_amount > 0 ? formatPrice(coupon.min_order_amount) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={coupon.usage_limit && coupon.usage_count >= coupon.usage_limit ? 'text-red-500 font-medium' : ''}>
                      {coupon.usage_count}
                    </span>
                    /{coupon.usage_limit ?? '∞'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {coupon.expires_at
                      ? new Date(coupon.expires_at).toLocaleDateString('ko-KR')
                      : '무제한'}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={async () => {
                        'use server'
                        await toggleCoupon(coupon.id, !coupon.is_active)
                      }}
                    >
                      <button
                        type="submit"
                        className={`text-xs px-2 py-0.5 font-medium transition-colors ${
                          coupon.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {coupon.is_active ? '활성' : '비활성'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
