'use client'

/**
 * 관리자 주문 목록 (강화 버전)
 * - 결제 상태 / 배송 상태 분리
 * - 고객 정보 / 배송지 정보 표시
 * - 운송장 입력
 */

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/shared/lib/utils'
import {
  updateOrderFulfillment,
  updateOrderTracking,
  cancelOrder,
  type FulfillmentStatus,
} from '@/features/admin/actions/update-order-fulfillment'

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  failed: '결제 실패',
  refunded: '환불 완료',
}

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  paid: 'bg-green-100 text-green-800 border-green-300',
  failed: 'bg-red-100 text-red-800 border-red-300',
  refunded: 'bg-orange-100 text-orange-800 border-orange-300',
}

const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  unfulfilled: '미처리',
  processing: '처리 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  canceled: '취소됨',
}

const FULFILLMENT_STATUS_COLORS: Record<FulfillmentStatus, string> = {
  unfulfilled: 'bg-gray-100 text-gray-800 border-gray-300',
  processing: 'bg-blue-100 text-blue-800 border-blue-300',
  shipped: 'bg-purple-100 text-purple-800 border-purple-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  canceled: 'bg-red-100 text-red-800 border-red-300',
}

interface Order {
  id: string
  user_id: string | null
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus
  total: number
  stripe_session_id: string | null
  tracking_number: string | null
  carrier: string | null
  customer_email: string | null
  customer_name: string | null
  shipping_address: any | null
  created_at: string
  updated_at: string
  order_items: Array<{
    id: string
    quantity: number
    price: number
    variant: {
      id: string
      sku: string
      color: string
      size: string
      product: {
        id: string
        name: string
        slug: string
      }
    } | null
  }>
}

export function OrdersListEnhanced({ orders }: { orders: Order[] }) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [trackingFormData, setTrackingFormData] = useState<{
    [orderId: string]: { number: string; carrier: string }
  }>({})

  const handleFulfillmentChange = async (orderId: string, newStatus: FulfillmentStatus) => {
    if (!confirm(`배송 상태를 "${FULFILLMENT_STATUS_LABELS[newStatus]}"(으)로 변경하시겠습니까?`)) return

    setUpdatingOrder(orderId)
    try {
      const result = await updateOrderFulfillment(orderId, newStatus)
      if (!result.success) {
        alert(`상태 변경 실패: ${result.error}`)
      }
    } catch (error: any) {
      alert(`상태 변경 실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleTrackingSubmit = async (orderId: string) => {
    const data = trackingFormData[orderId]
    if (!data?.number) {
      alert('운송장 번호를 입력하세요')
      return
    }

    setUpdatingOrder(orderId)
    try {
      const result = await updateOrderTracking(orderId, data.number, data.carrier || undefined)
      if (result.success) {
        alert('운송장 정보가 저장되고 배송 상태가 "배송 중"으로 변경되었습니다.')
        setTrackingFormData((prev) => {
          const next = { ...prev }
          delete next[orderId]
          return next
        })
      } else {
        alert(`운송장 저장 실패: ${result.error}`)
      }
    } catch (error: any) {
      alert(`운송장 저장 실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('주문을 취소하고 재고를 복구하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return

    setUpdatingOrder(orderId)
    try {
      const result = await cancelOrder(orderId)
      if (result.success) {
        alert('주문이 취소되고 재고가 복구되었습니다.')
      } else {
        alert(`주문 취소 실패: ${result.error}`)
      }
    } catch (error: any) {
      alert(`주문 취소 실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-gray-200 bg-white">
        <p className="text-gray-600">주문이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id
        const isUpdating = updatingOrder === order.id
        const itemsCount = order.order_items.length
        const firstItem = order.order_items[0]

        return (
          <div
            key={order.id}
            className="border-2 border-gray-200 bg-white hover:border-gray-400 transition-colors"
          >
            {/* 주문 헤더 (한 줄 요약) */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* 주문번호 */}
                <span className="font-mono text-sm text-gray-600 font-semibold">
                  #{order.id.slice(0, 8)}
                </span>

                {/* 결제 상태 */}
                <span className={`px-2 py-1 text-xs font-semibold rounded border ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>
                  💳 {PAYMENT_STATUS_LABELS[order.payment_status]}
                </span>

                {/* 배송 상태 */}
                <span className={`px-2 py-1 text-xs font-semibold rounded border ${FULFILLMENT_STATUS_COLORS[order.fulfillment_status]}`}>
                  📦 {FULFILLMENT_STATUS_LABELS[order.fulfillment_status]}
                </span>

                {/* 고객 이메일 */}
                {order.customer_email && (
                  <span className="text-sm text-gray-600 truncate max-w-xs">
                    {order.customer_email}
                  </span>
                )}

                {/* 아이템 요약 */}
                <span className="text-sm text-gray-500">
                  {firstItem?.variant?.product?.name || '제품 정보 없음'}
                  {itemsCount > 1 && ` 외 ${itemsCount - 1}개`}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* 총액 */}
                <span className="font-bold text-lg">{formatPrice(order.total)}</span>

                {/* 생성일 */}
                <span className="text-sm text-gray-500 min-w-[100px] text-right">
                  {new Date(order.created_at).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                {/* 상세 버튼 */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="px-3 py-1 text-sm border-2 border-black hover:bg-black hover:text-white transition-colors font-semibold"
                >
                  {isExpanded ? '접기' : '상세'}
                </button>
              </div>
            </div>

            {/* 상세 정보 (확장 시) */}
            {isExpanded && (
              <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-2 gap-6">
                  {/* 왼쪽: 주문 상품 */}
                  <div>
                    <h3 className="font-bold mb-3 text-lg">📦 주문 상품</h3>
                    <div className="space-y-2 mb-6">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm bg-white p-3 border border-gray-200">
                          <div>
                            {item.variant?.product ? (
                              <Link
                                href={`/product/${item.variant.product.slug}`}
                                className="font-semibold hover:underline"
                              >
                                {item.variant.product.name}
                              </Link>
                            ) : (
                              <span className="font-semibold text-gray-400">제품 정보 없음</span>
                            )}
                            {item.variant && (
                              <span className="text-gray-600 ml-2">
                                ({item.variant.color} / {item.variant.size}) x {item.quantity}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 고객 정보 */}
                    <h3 className="font-bold mb-3 text-lg">👤 고객 정보</h3>
                    <div className="bg-white p-3 border border-gray-200 text-sm space-y-1">
                      <p><strong>이름:</strong> {order.customer_name || '정보 없음'}</p>
                      <p><strong>이메일:</strong> {order.customer_email || '정보 없음'}</p>
                      <p className="text-gray-500">
                        <strong>User ID:</strong> {order.user_id || '게스트'}
                      </p>
                    </div>

                    {/* 배송지 정보 */}
                    {order.shipping_address && (
                      <>
                        <h3 className="font-bold mb-3 mt-6 text-lg">🏠 배송지</h3>
                        <div className="bg-white p-3 border border-gray-200 text-sm">
                          <p>{order.shipping_address.line1}</p>
                          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                          <p>
                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                          </p>
                          <p className="text-gray-600">{order.shipping_address.country}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 오른쪽: 관리 */}
                  <div>
                    {/* 배송 상태 변경 */}
                    <h3 className="font-bold mb-3 text-lg">📋 배송 상태 관리</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(['unfulfilled', 'processing', 'shipped', 'delivered'] as FulfillmentStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleFulfillmentChange(order.id, status)}
                          disabled={order.fulfillment_status === status || isUpdating || order.fulfillment_status === 'canceled'}
                          className={`px-3 py-2 text-sm font-semibold border-2 transition-colors ${
                            order.fulfillment_status === status
                              ? 'border-black bg-black text-white cursor-default'
                              : 'border-gray-300 bg-white hover:border-black disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {FULFILLMENT_STATUS_LABELS[status]}
                        </button>
                      ))}
                    </div>

                    {/* 운송장 정보 */}
                    <h3 className="font-bold mb-3 text-lg">🚚 운송장 정보</h3>
                    {order.tracking_number ? (
                      <div className="bg-green-50 border-2 border-green-300 p-3 mb-6">
                        <p className="text-sm font-semibold text-green-900">운송장 등록 완료</p>
                        <p className="text-sm text-green-700">택배사: {order.carrier || '미지정'}</p>
                        <p className="text-sm text-green-700 font-mono">운송장: {order.tracking_number}</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 p-3 mb-6">
                        <input
                          type="text"
                          placeholder="택배사 (예: CJ대한통운)"
                          value={trackingFormData[order.id]?.carrier || ''}
                          onChange={(e) =>
                            setTrackingFormData((prev) => ({
                              ...prev,
                              [order.id]: {
                                ...prev[order.id],
                                number: prev[order.id]?.number || '',
                                carrier: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-2 border border-gray-300 mb-2 text-sm"
                          disabled={isUpdating}
                        />
                        <input
                          type="text"
                          placeholder="운송장 번호"
                          value={trackingFormData[order.id]?.number || ''}
                          onChange={(e) =>
                            setTrackingFormData((prev) => ({
                              ...prev,
                              [order.id]: {
                                ...prev[order.id],
                                carrier: prev[order.id]?.carrier || '',
                                number: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-2 border border-gray-300 mb-2 text-sm"
                          disabled={isUpdating}
                        />
                        <button
                          onClick={() => handleTrackingSubmit(order.id)}
                          disabled={!trackingFormData[order.id]?.number || isUpdating}
                          className="w-full px-4 py-2 bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          운송장 등록 (→ 배송 중)
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          * 운송장 등록 시 자동으로 &quot;배송 중&quot; 상태로 변경됩니다.
                        </p>
                      </div>
                    )}

                    {/* 주문 취소 */}
                    {order.fulfillment_status !== 'canceled' && (
                      <>
                        <h3 className="font-bold mb-3 text-lg text-red-600">⚠️ 위험 구역</h3>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={isUpdating}
                          className="w-full px-4 py-2 border-2 border-red-500 text-red-600 font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ❌ 주문 취소 (재고 복구)
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          * 주문을 취소하고 재고를 자동으로 복구합니다. 되돌릴 수 없습니다.
                        </p>
                      </>
                    )}

                    {isUpdating && (
                      <div className="mt-4 text-center text-sm text-gray-600 animate-pulse">
                        처리 중...
                      </div>
                    )}

                    {/* 메타 정보 */}
                    <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
                      <p>생성: {new Date(order.created_at).toLocaleString('ko-KR')}</p>
                      <p>수정: {new Date(order.updated_at).toLocaleString('ko-KR')}</p>
                      {order.stripe_session_id && (
                        <p className="font-mono">Stripe: {order.stripe_session_id}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

