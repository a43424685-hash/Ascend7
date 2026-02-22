import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'
import { getOrders } from '@/entities/order/api/get-orders'
import { formatPrice } from '@/shared/lib/utils'

export const dynamic = 'force-dynamic'

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

const fulfillmentColors: Record<string, string> = {
  unfulfilled: 'bg-gray-100 text-gray-600',
  processing: 'bg-yellow-50 text-yellow-700',
  shipped: 'bg-blue-50 text-blue-700',
  delivered: 'bg-green-50 text-green-700',
  canceled: 'bg-red-50 text-red-600',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const orders = await getOrders(user.id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">주문 내역</h2>
        <span className="text-sm text-gray-400">{orders.length}건</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-sm p-16 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="text-gray-400 mb-4">주문 내역이 없습니다</p>
          <Link href="/shop" className="text-sm font-medium underline hover:no-underline">
            쇼핑하러 가기 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white border border-gray-100 hover:border-gray-300 rounded-sm p-5 transition-colors"
            >
              {/* 주문 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">
                    {new Date(order.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                  <p className="font-semibold text-sm">
                    {order.order_number ? `주문번호 ${order.order_number}` : `주문 #${order.id.slice(0, 8).toUpperCase()}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(order.total)}</p>
                  <div className="flex gap-1 mt-1 justify-end flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      order.payment_status === 'paid' ? 'bg-green-50 text-green-700' :
                      order.payment_status === 'refunded' ? 'bg-purple-50 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {paymentLabels[order.payment_status] || order.payment_status}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${fulfillmentColors[order.fulfillment_status] || 'bg-gray-100 text-gray-600'}`}>
                      {fulfillmentLabels[order.fulfillment_status] || order.fulfillment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 상품 목록 */}
              <div className="space-y-1.5 text-sm text-gray-600 border-t border-gray-50 pt-3">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="truncate max-w-xs">
                      {item.variant.product.name}
                      <span className="text-gray-400 ml-1">({item.variant.color}/{item.variant.size}) ×{item.quantity}</span>
                    </span>
                    <span className="shrink-0 ml-2">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-gray-400 text-xs">외 {order.items.length - 3}개 상품</p>
                )}
              </div>

              {/* 배송 중 운송장 표시 */}
              {order.tracking_number && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-blue-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span>배송 중 — 운송장 {order.tracking_number}</span>
                </div>
              )}

              <p className="text-[10px] text-gray-300 mt-3 text-right">상세 보기 →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
