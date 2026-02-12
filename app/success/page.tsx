'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/features/cart/cart-context'
import { Button } from '@/shared/ui/button'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('session_id')
    if (id) {
      setSessionId(id)
      clearCart()
    } else {
      router.push('/')
    }
  }, [searchParams, clearCart, router])

  if (!sessionId) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto" />
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-64 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      {/* 체크 아이콘 */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-3">주문이 완료되었습니다</h1>
      <p className="text-lg text-gray-600 mb-2">
        결제가 정상적으로 처리되었습니다.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        주문 확인 이메일이 발송됩니다. 마이페이지에서 주문 상태를 확인하실 수 있습니다.
      </p>

      {/* 주문 정보 카드 */}
      <div className="border-2 border-black p-6 mb-8 text-left">
        <h2 className="font-bold text-lg mb-4">주문 정보</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">주문 번호</span>
            <span className="font-mono font-semibold">{sessionId.slice(-12).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">결제 상태</span>
            <span className="bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">
              결제 완료
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">배송 상태</span>
            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-medium">
              준비 중
            </span>
          </div>
        </div>
      </div>

      {/* 다음 단계 안내 */}
      <div className="bg-gray-50 border border-gray-200 p-4 mb-8 text-left text-sm">
        <p className="font-semibold mb-2">다음 단계</p>
        <ul className="space-y-1 text-gray-600">
          <li>1. 주문 확인 이메일을 확인해주세요</li>
          <li>2. 상품 준비가 완료되면 배송이 시작됩니다</li>
          <li>3. 배송 시작 시 운송장 번호가 안내됩니다</li>
        </ul>
      </div>

      <div className="flex gap-4 justify-center">
        <Link href="/account">
          <Button>주문 내역 보기</Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline">쇼핑 계속하기</Button>
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto" />
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
            <div className="h-4 bg-gray-100 rounded w-64 mx-auto" />
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
