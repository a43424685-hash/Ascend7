import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { getOrders } from '@/entities/order/api/get-orders'
import { formatPrice } from '@/shared/lib/utils'
import { ProfileForm } from './profile-form'

export const dynamic = 'force-dynamic'

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
    .select('name, phone, email')
    .eq('id', user.id)
    .single()

  const profileData = {
    name: profile?.name || null,
    phone: profile?.phone || null,
    email: profile?.email || user.email || '',
  }

  // 주문 내역 조회
  const orders = await getOrders(user.id)

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">MY ACCOUNT</h1>

      {/* 프로필 섹션 */}
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 border-black">PROFILE</h2>
          <ProfileForm profile={profileData} />
        </div>

        {/* 주문 내역 섹션 */}
        <div>
          <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 border-black">ORDER HISTORY</h2>
          {orders.length === 0 ? (
            <p className="text-gray-600">주문 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border-2 border-gray-200 p-4 hover:border-black transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(order.total)}</p>
                      <span className={`text-xs px-2 py-1 uppercase ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.variant.product.name} ({item.variant.color}/{item.variant.size}) x{item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-gray-500">외 {order.items.length - 2}개 상품</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
