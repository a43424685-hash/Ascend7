import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { getOrders } from '@/entities/order/api/get-orders'
import { formatPrice } from '@/shared/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const orders = await getOrders(user.id)

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">ACCOUNT</h1>
      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-1">Email</p>
        <p className="font-semibold">{user.email}</p>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">ORDER HISTORY</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600">주문 내역이 없습니다.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border-2 border-black p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(order.total)}</p>
                    <p className="text-sm text-gray-600 uppercase">{order.status}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.variant.product.name} ({item.variant.color} /{' '}
                        {item.variant.size}) x {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

