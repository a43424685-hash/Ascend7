'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { cancelOrder, requestReturn, cancelReturnRequest } from './actions'

interface RefundRequestFormProps {
  orderId: string
  fulfillmentStatus: string
  returnStatus: string | null
  paymentStatus: string
  returnReason?: string | null
  returnRejectionReason?: string | null
}

// 반품 상태 라벨
const returnStatusLabels: Record<string, { label: string; color: string }> = {
  requested: { label: '반품 요청됨', color: 'bg-yellow-100 text-yellow-800' },
  received: { label: '반품 물품 도착', color: 'bg-blue-100 text-blue-800' },
  approved: { label: '검수 완료 (환불 예정)', color: 'bg-green-100 text-green-800' },
  rejected: { label: '반품 거절', color: 'bg-red-100 text-red-800' },
  refunded: { label: '환불 완료', color: 'bg-purple-100 text-purple-800' },
}

export function RefundRequestForm({
  orderId,
  fulfillmentStatus,
  returnStatus,
  paymentStatus,
  returnReason,
  returnRejectionReason,
}: RefundRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)

  const isPreShipping = ['unfulfilled', 'processing'].includes(fulfillmentStatus)
  const isPostShipping = ['shipped', 'delivered'].includes(fulfillmentStatus)
  const canCancel = isPreShipping && paymentStatus === 'paid' && (!returnStatus || returnStatus === 'none')
  const canRequestReturn = isPostShipping && paymentStatus === 'paid' && (!returnStatus || returnStatus === 'none')
  const canCancelReturnRequest = returnStatus === 'requested'

  // 이미 환불 완료
  if (paymentStatus === 'refunded' || returnStatus === 'refunded') {
    return (
      <div className="border-2 border-purple-200 bg-purple-50 p-4">
        <h2 className="font-bold mb-2 text-purple-800">환불 완료</h2>
        <p className="text-sm text-purple-700">
          이 주문은 환불 처리가 완료되었습니다.
        </p>
      </div>
    )
  }

  // 반품 진행 중인 경우 상태 표시
  if (returnStatus && returnStatus !== 'none' && returnStatus !== 'refunded') {
    const statusInfo = returnStatusLabels[returnStatus]

    return (
      <div className="border-2 border-gray-200 p-4">
        <h2 className="font-bold mb-3">반품/환불 상태</h2>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm ${statusInfo?.color || 'bg-gray-100'}`}>
              {statusInfo?.label || returnStatus}
            </span>
          </div>

          {returnReason && (
            <div className="text-sm">
              <p className="text-gray-500">요청 사유:</p>
              <p className="text-gray-800">{returnReason}</p>
            </div>
          )}

          {returnStatus === 'rejected' && returnRejectionReason && (
            <div className="bg-red-50 p-3 text-sm">
              <p className="text-red-600 font-semibold">거절 사유:</p>
              <p className="text-red-800">{returnRejectionReason}</p>
            </div>
          )}

          {returnStatus === 'requested' && (
            <div className="bg-blue-50 p-4 space-y-3">
              <div>
                <p className="font-semibold text-blue-800 mb-1">반송 안내</p>
                <p className="text-sm text-blue-700">
                  아래 주소로 상품을 보내주세요. 상품 수령 후 검수를 거쳐 환불이 진행됩니다.
                </p>
              </div>
              <div className="bg-white p-3 text-sm border border-blue-200">
                <p className="font-semibold">반송지 주소</p>
                <p className="text-gray-700 mt-1">
                  [우편번호] 서울특별시 강남구<br />
                  어센드 반품센터<br />
                  02-XXXX-XXXX
                </p>
              </div>
              <p className="text-xs text-blue-600">
                * 반송 운임은 고객 부담입니다. (상품 하자 시 착불 가능)
              </p>
            </div>
          )}

          {returnStatus === 'approved' && (
            <div className="bg-green-50 p-3 text-sm">
              <p className="text-green-800">
                검수가 완료되었습니다. 환불이 곧 처리될 예정입니다.
              </p>
            </div>
          )}

          {canCancelReturnRequest && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={async () => {
                  setIsSubmitting(true)
                  const result = await cancelReturnRequest(orderId)
                  if (result.success) {
                    setMessage({ type: 'success', text: result.message || '반품 요청이 취소되었습니다.' })
                  } else {
                    setMessage({ type: 'error', text: result.error || '오류가 발생했습니다.' })
                  }
                  setIsSubmitting(false)
                }}
                disabled={isSubmitting}
              >
                반품 요청 취소
              </Button>
            </div>
          )}
        </div>

        {message && (
          <div className={`mt-4 p-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
            {message.text}
          </div>
        )}
      </div>
    )
  }

  // 취소/반품 불가능한 경우
  if (!canCancel && !canRequestReturn) {
    return null
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setMessage({ type: 'error', text: '사유를 입력해주세요.' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    let result
    if (isPreShipping) {
      result = await cancelOrder(orderId, reason)
    } else {
      result = await requestReturn(orderId, reason)
    }

    if (result.success) {
      setMessage({ type: 'success', text: result.message || '요청이 완료되었습니다.' })
      setShowForm(false)
      setReason('')
    } else {
      setMessage({ type: 'error', text: result.error || '오류가 발생했습니다.' })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="border-2 border-gray-200 p-4">
      <h2 className="font-bold mb-3">
        {isPreShipping ? '주문 취소' : '반품 요청'}
      </h2>

      {message && (
        <div className={`mb-4 p-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      {!showForm ? (
        <div className="space-y-3">
          {isPreShipping && (
            <p className="text-sm text-gray-600">
              배송 준비 중인 주문입니다. 주문을 취소하시면 즉시 환불됩니다.
            </p>
          )}
          {isPostShipping && (
            <div className="bg-yellow-50 p-3 text-sm">
              <p className="text-yellow-800 font-semibold mb-1">안내</p>
              <p className="text-yellow-700">
                배송이 시작된 주문은 반품 절차가 필요합니다.
                반품 요청 후 상품을 보내주시면, <strong>회수 후 검수</strong>를 거쳐 환불이 진행됩니다.
              </p>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
          >
            {isPreShipping ? '주문 취소하기' : '반품 요청하기'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {isPreShipping ? '취소 사유' : '반품 사유'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isPreShipping ? '취소 사유를 입력해주세요' : '반품 사유를 상세히 입력해주세요 (10자 이상)'}
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none resize-none"
            />
          </div>

          {isPostShipping && (
            <div className="bg-gray-50 p-3 text-sm text-gray-600">
              <p className="font-semibold mb-1">반품 절차 안내</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>반품 요청 접수</li>
                <li>안내된 주소로 상품 발송</li>
                <li>상품 도착 후 검수 진행</li>
                <li>검수 통과 시 환불 처리</li>
              </ol>
              <p className="mt-2 text-xs text-gray-500">
                * 상품 하자가 아닌 경우 반송 운임은 고객 부담입니다.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리 중...' : (isPreShipping ? '주문 취소' : '반품 요청')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setReason('')
                setMessage(null)
              }}
              disabled={isSubmitting}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
