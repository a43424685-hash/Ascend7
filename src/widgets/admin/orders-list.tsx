'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/shared/lib/utils'
import { updateOrderStatus } from '@/features/admin/actions/update-order-status'
import { cancelOrder } from '@/features/admin/actions/cancel-order'

type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'canceled' | 'refunded'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  preparing: '준비 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  canceled: '취소됨',
  refunded: '환불됨',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  preparing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
  canceled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
}

interface Order {
  id: string
  user_id: string | null
  status: OrderStatus
  total: number
  stripe_session_id: string | null
  created_at: string
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
    }
  }>
}

export function OrdersList({ orders }: { orders: Order[] }) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, reason?: string) => {
    setUpdatingOrder(orderId)
    try {
      await updateOrderStatus(orderId, newStatus, reason)
      // 페이지 새로고침으로 업데이트된 상태 반영
      window.location.reload()
    } catch (error: any) {
      alert(`상태 변경 실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('주문 취소 이유를 입력하세요:')
    if (!reason) return

    if (!confirm('주문을 취소하고 재고를 복구하시겠습니까?')) return

    setUpdatingOrder(orderId)
    try {
      await cancelOrder(orderId, reason)
      alert('주문이 취소되고 재고가 복구되었습니다.')
      window.location.reload()
    } catch (error: any) {
      alert(`주문 취소 실패: ${error.message}`)
    } finally {
      setUpdatingOrder(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-gray-200">
        <p className="text-gray-600">주문이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id
        const isUpdating = updatingOrder === order.id

        return (
          <div
            key={order.id}
            className="border-2 border-black p-4"
          >
            {/* 주문 헤더 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-gray-600">
                  #{order.id.slice(0, 8)}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded ${STATUS_COLORS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">{formatPrice(order.total)}</span>
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="text-sm underline hover:no-underline"
                >
                  {isExpanded ? '접기' : '상세'}
                </button>
              </div>
            </div>

            {/* 상세 정보 (확장 시) */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {/* 주문 아이템 */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">주문 상품</h3>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <Link
                            href={`/product/${item.variant.product.slug}`}
                            className="hover:underline"
                          >
                            {item.variant.product.name}
                          </Link>
                          <span className="text-gray-600 ml-2">
                            ({item.variant.color} / {item.variant.size}) x {item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 고객 정보 */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">고객 정보</h3>
                  <p className="text-sm text-gray-600">
                    {order.user_id ? `User ID: ${order.user_id}` : '게스트 주문'}
                  </p>
                  {order.stripe_session_id && (
                    <p className="text-sm text-gray-600 font-mono">
                      Stripe Session: {order.stripe_session_id}
                    </p>
                  )}
                </div>

                {/* 상태 변경 */}
                <div>
                  <h3 className="font-semibold mb-2">상태 변경</h3>
                  <div className="flex gap-2 flex-wrap">
                    {(['pending', 'paid', 'preparing', 'shipped', 'delivered', 'canceled', 'refunded'] as OrderStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          const reason = prompt(`"${STATUS_LABELS[status]}"(으)로 변경하시겠습니까?\n변경 이유를 입력하세요 (선택):`)
                          if (reason !== null) {
                            handleStatusChange(order.id, status, reason || undefined)
                          }
                        }}
                        disabled={order.status === status || isUpdating}
                        className={`px-3 py-1 text-xs font-semibold border-2 transition-colors ${
                          order.status === status
                            ? 'border-black bg-black text-white cursor-default'
                            : 'border-gray-300 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                  {isUpdating && (
                    <p className="text-sm text-gray-600 mt-2">처리 중...</p>
                  )}
                </div>

                {/* 주문 취소 (재고 복구) */}
                {order.status !== 'canceled' && order.status !== 'refunded' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm font-semibold border-2 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ❌ 주문 취소 (재고 복구)
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      * 주문을 취소하고 재고를 자동으로 복구합니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

