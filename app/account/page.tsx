import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'
import { getOrders } from '@/entities/order/api/get-orders'
import { formatPrice } from '@/shared/lib/utils'
import { ProfileForm } from './profile-form'
import { LogoutButton } from '@/features/auth/logout-button'

export const dynamic = 'force-dynamic'

// 상태 라벨 변환
const paymentLabels: Record<string, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  failed: '결제 실패',
  refunded: '환불 완료',
}

const fulfillmentLabels: Record<string, string> = {
  unfulfilled: '준비 중',
  processing: '상품 준비',
  shipped: '배송 중',
  delivered: '배송 완료',
  canceled: '취소됨',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // 프로필 정보 조회
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, phone, email')
    .eq('id', user.id)
    .single()

  const profileData = {
    display_name: profile?.display_name || null,
    phone: profile?.phone || null,
    email: profile?.email || user.email || '',
  }

  // 주문 내역 조회
  const orders = await getOrders(user.id)

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 헤더 + 로그아웃 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">MY ACCOUNT</h1>
        <div className="flex items-center gap-4">
          {profileData.display_name && (
            <span className="text-gray-600">
              안녕하세요, <strong>{profileData.display_name}</strong>님
            </span>
          )}
          <LogoutButton />
        </div>
      </div>

      {/* 프로필 & 주문 내역 */}
      <div className="grid md:grid-cols-2 gap-12">
        {/* 프로필 섹션 */}
        <div>
          <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 border-black">
            PROFILE
          </h2>
          <ProfileForm profile={profileData} />
        </div>

        {/* 주문 내역 섹션 */}
        <div>
          <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 border-black">
            ORDER HISTORY
          </h2>
          {orders.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-2">주문 내역이 없습니다.</p>
              <Link
                href="/shop"
                className="text-black underline hover:no-underline"
              >
                쇼핑하러 가기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block border-2 border-gray-200 p-4 hover:border-black transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(order.total)}</p>
                      <div className="flex gap-1 mt-1 justify-end flex-wrap">
                        {/* 결제 상태 */}
                        <span
                          className={`text-xs px-2 py-0.5 ${
                            order.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : order.payment_status === 'refunded'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {paymentLabels[order.payment_status] ||
                            order.payment_status}
                        </span>
                        {/* 배송 상태 */}
                        <span
                          className={`text-xs px-2 py-0.5 ${
                            order.fulfillment_status === 'delivered'
                              ? 'bg-blue-100 text-blue-800'
                              : order.fulfillment_status === 'shipped'
                                ? 'bg-sky-100 text-sky-800'
                                : order.fulfillment_status === 'canceled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {fulfillmentLabels[order.fulfillment_status] ||
                            order.fulfillment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.variant.product.name} ({item.variant.color}/
                          {item.variant.size}) x{item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-gray-500">
                        외 {order.items.length - 2}개 상품
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    클릭하여 상세 보기 →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
