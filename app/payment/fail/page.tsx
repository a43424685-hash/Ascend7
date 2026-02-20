'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const message = searchParams.get('message')
  const orderId = searchParams.get('orderId')

  // 사용자가 취소한 경우
  const isUserCancel = code === 'PAY_PROCESS_CANCELED' || code === 'USER_CANCEL'

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {isUserCancel ? (
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-3">
        {isUserCancel ? '결제를 취소했습니다' : '결제에 실패했습니다'}
      </h1>

      {!isUserCancel && message && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">
          {message}
          {code && <span className="ml-2 text-red-400 text-xs">({code})</span>}
        </div>
      )}

      <p className="text-gray-600 mb-8">
        {isUserCancel
          ? '장바구니에 상품이 그대로 유지되어 있습니다.'
          : '결제 처리 중 오류가 발생했습니다. 다시 시도하거나 다른 결제 수단을 이용해주세요.'}
      </p>

      <div className="flex gap-4 justify-center flex-wrap">
        <Link href="/checkout">
          <Button>다시 결제하기</Button>
        </Link>
        <Link href="/cart">
          <Button variant="outline">장바구니로 돌아가기</Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline">쇼핑 계속하기</Button>
        </Link>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center">로딩 중...</div>}>
      <PaymentFailContent />
    </Suspense>
  )
}
