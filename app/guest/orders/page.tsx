'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

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

interface OrderResult {
  order_number: string
  payment_status: string
  fulfillment_status: string
  total: number
  tracking_number: string | null
  carrier: string | null
  customer_name: string | null
  masked_address: string
  return_status: string | null
  created_at: string
  items: Array<{
    quantity: number
    price: number
    product_name: string
    color: string
    size: string
  }>
}

export default function GuestOrdersPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<OrderResult | null>(null)

  const formatPhoneNumber = (value: string) => {
    const nums = value.replace(/\D/g, '')
    if (nums.length <= 3) return nums
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orderNumber.trim() || !phone.trim()) {
      setError('주문번호와 연락처를 모두 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/guest/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          phone: phone.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '주문을 찾을 수 없습니다.')
        return
      }

      setResult(data)
    } catch {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">비회원 주문 조회</h1>
      <p className="text-gray-600 mb-8">
        주문번호와 주문 시 입력한 연락처로 배송 상태를 확인할 수 있습니다.
      </p>

      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="border-2 border-black p-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">주문번호</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full px-3 py-2.5 border-2 border-gray-300 focus:border-black outline-none"
              placeholder="A7-260212-XXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">연락처</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              maxLength={13}
              className="w-full px-3 py-2.5 border-2 border-gray-300 focus:border-black outline-none"
              placeholder="010-0000-0000"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '조회 중...' : '주문 조회'}
          </Button>
        </div>
      </form>

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-6 text-center mb-8">
          <p className="text-red-800 font-semibold mb-1">조회 결과 없음</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div className="border-2 border-black p-6 space-y-6">
          {/* 주문 기본 정보 */}
          <div>
            <h2 className="text-xl font-bold mb-4">주문 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호</span>
                <span className="font-mono font-semibold">{result.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문일시</span>
                <span>{new Date(result.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">수령인</span>
                <span>{result.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배송지</span>
                <span>{result.masked_address}</span>
              </div>
            </div>
          </div>

          {/* 상태 배지 */}
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm font-medium ${
              result.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
              result.payment_status === 'refunded' ? 'bg-purple-100 text-purple-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {paymentLabels[result.payment_status] || result.payment_status}
            </span>
            <span className={`px-3 py-1 text-sm font-medium ${
              result.fulfillment_status === 'delivered' ? 'bg-blue-100 text-blue-800' :
              result.fulfillment_status === 'shipped' ? 'bg-sky-100 text-sky-800' :
              result.fulfillment_status === 'canceled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {fulfillmentLabels[result.fulfillment_status] || result.fulfillment_status}
            </span>
            {result.return_status && (
              <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800">
                반품: {result.return_status}
              </span>
            )}
          </div>

          {/* 운송장 정보 */}
          {result.tracking_number && (
            <div className="bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-semibold text-blue-800 mb-1">배송 정보</p>
              <p className="text-sm text-blue-700">
                택배사: {result.carrier || '-'} / 운송장: {result.tracking_number}
              </p>
            </div>
          )}

          {/* 상품 목록 */}
          <div>
            <h3 className="font-bold mb-3">주문 상품</h3>
            <div className="space-y-2">
              {result.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <div>
                    <span className="font-medium">{item.product_name}</span>
                    <span className="text-gray-500 ml-2">
                      ({item.color}/{item.size}) x{item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold mt-3 pt-3 border-t-2 border-black">
              <span>합계</span>
              <span>{formatPrice(result.total)}</span>
            </div>
          </div>

          {/* 안내 */}
          <div className="bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
            <p>반품/환불 요청은 로그인 후 주문 상세에서 가능합니다.</p>
            <Link href="/auth/login" className="text-black underline font-semibold">
              로그인하기
            </Link>
          </div>
        </div>
      )}

      {/* 하단 링크 */}
      <div className="text-center mt-8">
        <Link href="/shop" className="text-sm text-gray-600 hover:underline">
          쇼핑하러 가기 →
        </Link>
      </div>
    </div>
  )
}
