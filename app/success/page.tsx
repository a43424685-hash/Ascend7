'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStorage } from '@/features/cart/use-cart-storage'
import { Button } from '@/shared/ui/button'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCartStorage()
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
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 text-center max-w-2xl">
      <h1 className="text-4xl font-bold mb-4">ORDER CONFIRMED</h1>
      <p className="text-lg text-gray-600 mb-8">
        Thank you for your purchase. Your order has been confirmed.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Session ID: {sessionId}
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/shop">
          <Button variant="outline">CONTINUE SHOPPING</Button>
        </Link>
        <Link href="/account">
          <Button>VIEW ORDERS</Button>
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
          <p>Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}

