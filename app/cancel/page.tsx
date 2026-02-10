import Link from 'next/link'
import { Button } from '@/shared/ui/button'

export default function CancelPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center max-w-2xl">
      <h1 className="text-4xl font-bold mb-4">PAYMENT CANCELLED</h1>
      <p className="text-lg text-gray-600 mb-8">
        Your payment was cancelled. No charges were made.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/cart">
          <Button variant="outline">RETURN TO CART</Button>
        </Link>
        <Link href="/shop">
          <Button>CONTINUE SHOPPING</Button>
        </Link>
      </div>
    </div>
  )
}

