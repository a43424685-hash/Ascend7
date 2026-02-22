import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'
import { getOrderById } from '@/entities/order/api/get-order-by-id'
import { formatPrice } from '@/shared/lib/utils'
import { RefundRequestForm } from './refund-request-form'

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

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 로그인 체크
  if (!user) {
    redirect('/auth/login')
  }

  // 주문 조회 (본인 주문만)
  const order = await getOrderById(params.id, user.id)

  if (!order) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* 뒤로가기 */}
      <Link
        href="/account"
        className="inline-block mb-6 text-sm text-gray-600 hover:text-black"
      >
        ← 마이페이지로 돌아가기
      </Link>

      {/* 주문 헤더 */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold">주문 상세</h1>
        <p className="text-gray-600 mt-1">Order #{order.id.slice(0, 8)}</p>
      </div>

      {/* 주문 정보 */}
      <div className="grid gap-6">
        {/* 상태 섹션 */}
        <div className="border-2 border-gray-200 p-4">
          <h2 className="font-bold mb-3">주문 상태</h2>
          <div className="flex gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-500 mb-1">결제</p>
              <span
                className={`text-sm px-3 py-1 ${
                  order.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : order.payment_status === 'refunded'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {paymentLabels[order.payment_status] || order.payment_status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">배송</p>
              <span
                className={`text-sm px-3 py-1 ${
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

        {/* 배송 정보 (운송장이 있는 경우) */}
        {order.tracking_number && (
          <div className="border-2 border-blue-100 bg-blue-50 p-4">
            <h2 className="font-bold mb-3 text-blue-900">배송 정보</h2>
            <div className="space-y-2 text-sm">
              {order.carrier && (
                <p>
                  <span className="text-gray-500">택배사:</span>{' '}
                  <span className="font-medium">{order.carrier}</span>
                </p>
              )}
              <p>
                <span className="text-gray-500">운송장 번호:</span>{' '}
                <span className="font-mono font-medium">{order.tracking_number}</span>
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                {/* CJ대한통운 */}
                <a
                  href={`https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=${order.tracking_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  CJ대한통운 배송 조회
                </a>
                {/* 롯데택배 */}
                <a
                  href={`https://www.lotteglogis.com/open/tracking?invno=${order.tracking_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                >
                  롯데택배 배송 조회
                </a>
                {/* 한진택배 */}
                <a
                  href={`https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&wblnumText2=${order.tracking_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                >
                  한진택배 배송 조회
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 주문 상품 */}
        <div className="border-2 border-gray-200 p-4">
          <h2 className="font-bold mb-3">주문 상품</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <Link
                    href={`/product/${item.variant.product.slug}`}
                    className="font-medium hover:underline"
                  >
                    {item.variant.product.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {item.variant.color} / {item.variant.size}
                  </p>
                  <p className="text-xs text-gray-400">SKU: {item.variant.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">x{item.quantity}</p>
                  <p className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 금액 */}
        <div className="border-2 border-black p-4">
          <div className="flex justify-between items-center">
            <span className="font-bold">총 결제 금액</span>
            <span className="text-xl font-bold">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* 주문 정보 */}
        <div className="border-2 border-gray-200 p-4">
          <h2 className="font-bold mb-3">주문 정보</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">주문일:</span>{' '}
              {new Date(order.created_at).toLocaleString('ko-KR')}
            </p>
            {order.customer_email && (
              <p>
                <span className="text-gray-500">이메일:</span>{' '}
                {order.customer_email}
              </p>
            )}
            {order.customer_name && (
              <p>
                <span className="text-gray-500">주문자:</span>{' '}
                {order.customer_name}
              </p>
            )}
            {order.shipping_address && (
              <div>
                <p className="text-gray-500">배송지:</p>
                <p className="ml-2">
                  {typeof order.shipping_address === 'object' && 'address' in order.shipping_address ? (
                    <>
                      [{order.shipping_address.postal_code}] {order.shipping_address.address}
                      {order.shipping_address.address_detail && `, ${order.shipping_address.address_detail}`}
                      <br />
                      {order.shipping_address.name} / {order.shipping_address.phone}
                      {order.shipping_address.memo && (
                        <><br /><span className="text-gray-400">메모: {order.shipping_address.memo}</span></>
                      )}
                    </>
                  ) : (
                    <>
                      {order.shipping_address.line1}
                      {order.shipping_address.line2 && `, ${order.shipping_address.line2}`}
                      <br />
                      {order.shipping_address.city} {order.shipping_address.state}{' '}
                      {order.shipping_address.postal_code}
                      <br />
                      {order.shipping_address.country}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 환불/반품 요청 섹션 */}
        <RefundRequestForm
          orderId={order.id}
          fulfillmentStatus={order.fulfillment_status}
          returnStatus={order.return_status}
          paymentStatus={order.payment_status}
          returnReason={order.return_reason}
          returnRejectionReason={order.return_rejection_reason}
        />
      </div>
    </div>
  )
}
