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
import {
  requestReturn,
  markReturnReceived,
  approveReturn,
  rejectReturn,
  processRefund,
  cancelReturnRequest,
  type ReturnStatus,
} from '@/features/admin/actions/return-management'

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
  processing: '배송준비중',
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

const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  none: '-',
  requested: '반품요청',
  received: '반품도착',
  approved: '검수통과',
  rejected: '검수실패',
  refunded: '환불완료',
}

const RETURN_STATUS_COLORS: Record<ReturnStatus, string> = {
  none: 'bg-gray-50 text-gray-400 border-gray-200',
  requested: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  received: 'bg-blue-100 text-blue-800 border-blue-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  refunded: 'bg-purple-100 text-purple-800 border-purple-300',
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
  // 반품/환불 관련
  return_status: ReturnStatus
  return_reason: string | null
  return_inspection_notes: string | null
  return_rejection_reason: string | null
  return_requested_at: string | null
  refunded_at: string | null
  stripe_refund_id: string | null
  refund_amount: number | null
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
  const [returnFormData, setReturnFormData] = useState<{
    [orderId: string]: { reason: string; rejectionReason: string; inspectionNotes: string }
  }>({})

  // 필터 & 검색 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all')
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentStatus | 'all'>('all')
  const [returnFilter, setReturnFilter] = useState<ReturnStatus | 'all' | 'active'>('all')

  // 필터링된 주문 목록
  const filteredOrders = orders.filter((order) => {
    // 검색 필터 (주문번호 또는 이메일)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesId = order.id.toLowerCase().includes(query)
      const matchesEmail = order.customer_email?.toLowerCase().includes(query)
      const matchesName = order.customer_name?.toLowerCase().includes(query)
      if (!matchesId && !matchesEmail && !matchesName) return false
    }
    // 결제 상태 필터
    if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) return false
    // 배송 상태 필터
    if (fulfillmentFilter !== 'all' && order.fulfillment_status !== fulfillmentFilter) return false
    // 반품 상태 필터
    if (returnFilter === 'active') {
      if (!['requested', 'received', 'approved'].includes(order.return_status || 'none')) return false
    } else if (returnFilter !== 'all' && order.return_status !== returnFilter) {
      return false
    }
    return true
  })

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

  // 반품 관련 핸들러
  const handleRequestReturn = async (orderId: string) => {
    const reason = returnFormData[orderId]?.reason
    if (!reason) {
      alert('반품 사유를 입력해주세요.')
      return
    }
    setUpdatingOrder(orderId)
    try {
      const result = await requestReturn(orderId, reason)
      if (result.success) {
        alert('반품 요청이 접수되었습니다.')
        setReturnFormData((prev) => ({ ...prev, [orderId]: { reason: '', rejectionReason: '', inspectionNotes: '' } }))
      } else {
        alert(`실패: ${result.error}`)
      }
    } catch (error: any) {
      alert(`실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleMarkReceived = async (orderId: string) => {
    if (!confirm('반품 물품이 도착했음을 확인하시겠습니까?')) return
    setUpdatingOrder(orderId)
    try {
      const result = await markReturnReceived(orderId)
      if (result.success) {
        alert('반품 도착이 확인되었습니다. 검수를 진행해주세요.')
      } else {
        alert(`실패: ${result.error}`)
      }
    } catch (error: any) {
      alert(`실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleApproveReturn = async (orderId: string) => {
    const notes = returnFormData[orderId]?.inspectionNotes
    if (!confirm('검수 통과 처리하시겠습니까? 이후 환불이 가능해집니다.')) return
    setUpdatingOrder(orderId)
    try {
      const result = await approveReturn(orderId, notes)
      if (result.success) {
        alert('검수 통과! 이제 환불을 실행할 수 있습니다.')
      } else {
        alert(`실패: ${result.error}`)
      }
    } catch (error: any) {
      alert(`실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleRejectReturn = async (orderId: string) => {
    const reason = returnFormData[orderId]?.rejectionReason
    if (!reason) {
      alert('거부 사유를 입력해주세요.')
      return
    }
    if (!confirm('검수 실패 처리하시겠습니까? 환불이 불가능해집니다.')) return
    setUpdatingOrder(orderId)
    try {
      const result = await rejectReturn(orderId, reason)
      if (result.success) {
        alert('검수 실패 처리되었습니다.')
        setReturnFormData((prev) => ({ ...prev, [orderId]: { reason: '', rejectionReason: '', inspectionNotes: '' } }))
      } else {
        alert(`실패: ${result.error}`)
      }
    } catch (error: any) {
      alert(`실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleProcessRefund = async (orderId: string, total: number) => {
    if (!confirm(`${formatPrice(total)} 환불을 실행하시겠습니까?\nStripe에서 실제 환불이 진행됩니다.`)) return
    setUpdatingOrder(orderId)
    try {
      const result = await processRefund(orderId)
      if (result.success) {
        alert(`환불 완료! Refund ID: ${result.refundId}`)
      } else {
        alert(`환불 실패: ${result.error}`)
      }
    } catch (error: any) {
      alert(`환불 실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleCancelReturnRequest = async (orderId: string) => {
    if (!confirm('반품 요청을 취소하시겠습니까?')) return
    setUpdatingOrder(orderId)
    try {
      const result = await cancelReturnRequest(orderId)
      if (result.success) {
        alert('반품 요청이 취소되었습니다.')
      } else {
        alert(`실패: ${result.error}`)
      }
    } catch (error: any) {
      alert(`실패: ${error.message}`)
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
      {/* 필터 & 검색 UI */}
      <div className="bg-white border-2 border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 검색 */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="주문번호, 이메일, 이름 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none text-sm"
            />
          </div>

          {/* 결제 상태 필터 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-600">결제:</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
              className="px-3 py-2 border-2 border-gray-300 focus:border-black outline-none text-sm bg-white"
            >
              <option value="all">전체</option>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* 배송 상태 필터 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-600">배송:</label>
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value as FulfillmentStatus | 'all')}
              className="px-3 py-2 border-2 border-gray-300 focus:border-black outline-none text-sm bg-white"
            >
              <option value="all">전체</option>
              {Object.entries(FULFILLMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* 반품 상태 필터 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-600">반품:</label>
            <select
              value={returnFilter}
              onChange={(e) => setReturnFilter(e.target.value as ReturnStatus | 'all' | 'active')}
              className="px-3 py-2 border-2 border-gray-300 focus:border-black outline-none text-sm bg-white"
            >
              <option value="all">전체</option>
              <option value="active">🔴 처리필요</option>
              {Object.entries(RETURN_STATUS_LABELS).filter(([k]) => k !== 'none').map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* 결과 카운트 */}
          <div className="text-sm text-gray-500">
            {filteredOrders.length === orders.length
              ? `총 ${orders.length}건`
              : `${filteredOrders.length} / ${orders.length}건`
            }
          </div>
        </div>
      </div>

      {/* 필터 결과 없음 */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 bg-white">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setPaymentFilter('all')
              setFulfillmentFilter('all')
            }}
            className="mt-2 text-sm text-black underline hover:no-underline"
          >
            필터 초기화
          </button>
        </div>
      )}

      {filteredOrders.map((order) => {
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

                {/* 반품 상태 (none이 아닐 때만 표시) */}
                {order.return_status && order.return_status !== 'none' && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded border ${RETURN_STATUS_COLORS[order.return_status]}`}>
                    🔄 {RETURN_STATUS_LABELS[order.return_status]}
                  </span>
                )}

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

                    {/* 반품/환불 관리 */}
                    {order.payment_status === 'paid' && order.fulfillment_status !== 'canceled' && (
                      <>
                        <h3 className="font-bold mb-3 text-lg">🔄 반품/환불 관리</h3>
                        <div className="bg-white border border-gray-200 p-3 mb-6">
                          {/* 현재 반품 상태 표시 */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-semibold">반품 상태:</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded border ${RETURN_STATUS_COLORS[order.return_status || 'none']}`}>
                              {RETURN_STATUS_LABELS[order.return_status || 'none']}
                            </span>
                          </div>

                          {/* 반품 사유/거부 사유 표시 */}
                          {order.return_reason && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>반품 사유:</strong> {order.return_reason}
                            </p>
                          )}
                          {order.return_rejection_reason && (
                            <p className="text-sm text-red-600 mb-2">
                              <strong>거부 사유:</strong> {order.return_rejection_reason}
                            </p>
                          )}
                          {order.stripe_refund_id && (
                            <p className="text-sm text-purple-600 mb-2 font-mono">
                              <strong>Refund ID:</strong> {order.stripe_refund_id}
                            </p>
                          )}

                          {/* 배송 전: 즉시 환불 가능 */}
                          {['unfulfilled', 'processing'].includes(order.fulfillment_status) && (
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <p className="text-xs text-blue-600 mb-2">📌 배송 전 - 즉시 환불 가능</p>
                              {(order.return_status === 'none' || order.return_status === 'requested') && (
                                <button
                                  onClick={() => handleProcessRefund(order.id, order.total)}
                                  disabled={isUpdating}
                                  className="w-full px-4 py-2 bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50 text-sm"
                                >
                                  💰 즉시 환불 ({formatPrice(order.total)})
                                </button>
                              )}
                            </div>
                          )}

                          {/* 배송 후: 단계별 반품 프로세스 */}
                          {['shipped', 'delivered'].includes(order.fulfillment_status) && (
                            <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
                              <p className="text-xs text-orange-600 mb-2">📌 배송 후 - 반품 접수 → 도착 → 검수 → 환불</p>

                              {/* none: 반품 요청 접수 */}
                              {order.return_status === 'none' && (
                                <div>
                                  <input
                                    type="text"
                                    placeholder="반품 사유 입력"
                                    value={returnFormData[order.id]?.reason || ''}
                                    onChange={(e) =>
                                      setReturnFormData((prev) => ({
                                        ...prev,
                                        [order.id]: { ...prev[order.id], reason: e.target.value, rejectionReason: '', inspectionNotes: '' },
                                      }))
                                    }
                                    className="w-full p-2 border border-gray-300 mb-2 text-sm"
                                    disabled={isUpdating}
                                  />
                                  <button
                                    onClick={() => handleRequestReturn(order.id)}
                                    disabled={isUpdating || !returnFormData[order.id]?.reason}
                                    className="w-full px-4 py-2 bg-yellow-500 text-white font-semibold hover:bg-yellow-600 disabled:opacity-50 text-sm"
                                  >
                                    📥 반품 요청 접수
                                  </button>
                                </div>
                              )}

                              {/* requested: 도착 확인 또는 취소 */}
                              {order.return_status === 'requested' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleMarkReceived(order.id)}
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 text-sm"
                                  >
                                    📦 반품 도착 확인
                                  </button>
                                  <button
                                    onClick={() => handleCancelReturnRequest(order.id)}
                                    disabled={isUpdating}
                                    className="px-4 py-2 border border-gray-400 text-gray-600 font-semibold hover:bg-gray-100 disabled:opacity-50 text-sm"
                                  >
                                    취소
                                  </button>
                                </div>
                              )}

                              {/* received: 검수 (승인/거부) */}
                              {order.return_status === 'received' && (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    placeholder="검수 메모 (선택)"
                                    value={returnFormData[order.id]?.inspectionNotes || ''}
                                    onChange={(e) =>
                                      setReturnFormData((prev) => ({
                                        ...prev,
                                        [order.id]: { ...prev[order.id], inspectionNotes: e.target.value },
                                      }))
                                    }
                                    className="w-full p-2 border border-gray-300 text-sm"
                                    disabled={isUpdating}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleApproveReturn(order.id)}
                                      disabled={isUpdating}
                                      className="flex-1 px-4 py-2 bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 text-sm"
                                    >
                                      ✅ 검수 통과
                                    </button>
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        placeholder="거부 사유"
                                        value={returnFormData[order.id]?.rejectionReason || ''}
                                        onChange={(e) =>
                                          setReturnFormData((prev) => ({
                                            ...prev,
                                            [order.id]: { ...prev[order.id], rejectionReason: e.target.value },
                                          }))
                                        }
                                        className="w-full p-2 border border-gray-300 text-sm mb-1"
                                        disabled={isUpdating}
                                      />
                                      <button
                                        onClick={() => handleRejectReturn(order.id)}
                                        disabled={isUpdating || !returnFormData[order.id]?.rejectionReason}
                                        className="w-full px-4 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 text-sm"
                                      >
                                        ❌ 검수 실패
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* approved: 환불 실행 */}
                              {order.return_status === 'approved' && (
                                <button
                                  onClick={() => handleProcessRefund(order.id, order.total)}
                                  disabled={isUpdating}
                                  className="w-full px-4 py-2 bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50 text-sm"
                                >
                                  💰 환불 실행 ({formatPrice(order.total)})
                                </button>
                              )}

                              {/* rejected: 정보 표시만 */}
                              {order.return_status === 'rejected' && (
                                <p className="text-sm text-red-600">검수 실패로 환불이 거부되었습니다.</p>
                              )}

                              {/* refunded: 완료 표시 */}
                              {order.return_status === 'refunded' && (
                                <p className="text-sm text-purple-600">✅ 환불이 완료되었습니다.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* 환불 완료된 주문 표시 */}
                    {order.payment_status === 'refunded' && (
                      <div className="bg-purple-50 border-2 border-purple-300 p-3 mb-6">
                        <p className="text-sm font-semibold text-purple-900">💰 환불 완료</p>
                        {order.refunded_at && (
                          <p className="text-xs text-purple-700">환불일: {new Date(order.refunded_at).toLocaleString('ko-KR')}</p>
                        )}
                        {order.stripe_refund_id && (
                          <p className="text-xs text-purple-700 font-mono">Refund ID: {order.stripe_refund_id}</p>
                        )}
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

