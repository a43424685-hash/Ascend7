'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/features/cart/cart-context'
import { getCartItemsClient } from '@/entities/cart/api/get-cart-items-client'
import { createCheckoutSession } from '@/features/checkout/actions/create-checkout-session'
import { getDefaultShippingInfo, type ShippingInfo } from '@/features/checkout/actions/get-default-shipping'
import type { CartItemWithVariant } from '@/shared/types/cart'
import { formatPrice } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, isLoaded } = useCart()
  const [cartItemsWithData, setCartItemsWithData] = useState<CartItemWithVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 배송 정보 폼 상태
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
    postalCode: '',
    memo: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ShippingInfo, string>>>({})

  useEffect(() => {
    if (!isLoaded) return

    if (cartItems.length === 0) {
      router.push('/cart')
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // 장바구니 데이터 로드
        const items = await getCartItemsClient(cartItems)
        setCartItemsWithData(items)

        if (items.length === 0) {
          router.push('/cart')
          return
        }

        // 기본 배송지 로드 (로그인 시)
        const defaultInfo = await getDefaultShippingInfo()
        if (defaultInfo) {
          setShippingInfo(prev => ({
            ...prev,
            ...defaultInfo,
          }))
        }
      } catch (err: any) {
        setError(err.message || '장바구니를 불러올 수 없습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [cartItems, isLoaded, router])

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ShippingInfo, string>> = {}

    if (!shippingInfo.name.trim()) errors.name = '이름을 입력해주세요'
    if (!shippingInfo.phone.trim()) errors.phone = '연락처를 입력해주세요'
    if (!shippingInfo.address.trim()) errors.address = '주소를 입력해주세요'
    if (!shippingInfo.postalCode.trim()) errors.postalCode = '우편번호를 입력해주세요'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleCheckout = async () => {
    if (cartItemsWithData.length === 0) return
    if (!validateForm()) return

    setIsProcessing(true)
    setError(null)

    try {
      const { url } = await createCheckoutSession(cartItemsWithData, shippingInfo)
      if (url) {
        window.location.href = url
      } else {
        setError('결제 세션 생성에 실패했습니다')
      }
    } catch (err: any) {
      setError(err.message || '결제 처리 중 오류가 발생했습니다')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (cartItemsWithData.length === 0) {
    return null
  }

  const subtotal = cartItemsWithData.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  )

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">CHECKOUT</h1>

      {/* 배송 정보 입력 */}
      <div className="border-2 border-black p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">배송 정보</h2>
        <div className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={shippingInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:border-black outline-none`}
              placeholder="수령인 이름"
            />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={shippingInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border-2 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-black outline-none`}
              placeholder="010-0000-0000"
            />
            {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
          </div>

          {/* 우편번호 */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              우편번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={shippingInfo.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className={`w-full px-3 py-2 border-2 ${formErrors.postalCode ? 'border-red-500' : 'border-gray-300'} focus:border-black outline-none`}
              placeholder="12345"
            />
            {formErrors.postalCode && <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>}
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={shippingInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border-2 ${formErrors.address ? 'border-red-500' : 'border-gray-300'} focus:border-black outline-none`}
              placeholder="도로명 주소"
            />
            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
          </div>

          {/* 상세 주소 */}
          <div>
            <label className="block text-sm font-semibold mb-1">상세 주소</label>
            <input
              type="text"
              value={shippingInfo.addressDetail}
              onChange={(e) => handleInputChange('addressDetail', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
              placeholder="아파트, 동/호수 등"
            />
          </div>

          {/* 배송 메모 */}
          <div>
            <label className="block text-sm font-semibold mb-1">배송 메모</label>
            <input
              type="text"
              value={shippingInfo.memo}
              onChange={(e) => handleInputChange('memo', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black outline-none"
              placeholder="부재시 문앞에 놓아주세요"
            />
          </div>
        </div>
      </div>

      {/* 주문 요약 */}
      <div className="border-2 border-gray-300 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">주문 상품</h2>
        <div className="space-y-2 mb-4">
          {cartItemsWithData.map((item) => (
            <div key={item.variant_id} className="flex justify-between text-sm">
              <span>
                {item.product.name} ({item.variant.color} / {item.variant.size})
                x {item.quantity}
              </span>
              <span>{formatPrice(item.variant.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-300 pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>총 결제금액</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <Button
        onClick={handleCheckout}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? '처리 중...' : '결제하기'}
      </Button>
    </div>
  )
}
