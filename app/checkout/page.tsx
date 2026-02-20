'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/features/cart/cart-context'
import { getCartItemsClient } from '@/entities/cart/api/get-cart-items-client'
// import { createCheckoutSession } from '@/features/checkout/actions/create-checkout-session' // Stripe (주석처리)
import { createPendingOrder } from '@/features/checkout/actions/create-pending-order'
import {
  getDefaultShippingInfo,
  saveDefaultShippingInfo,
  type ShippingInfo,
  type CheckoutAuthStatus,
} from '@/features/checkout/actions/get-default-shipping'
import type { CartItemWithVariant } from '@/shared/types/cart'
import { formatPrice } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { AddressSearch } from '@/shared/ui/address-search'

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, isLoaded } = useCart()
  const [cartItemsWithData, setCartItemsWithData] = useState<CartItemWithVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [authStatus, setAuthStatus] = useState<CheckoutAuthStatus | null>(null)

  // TossPayments 위젯 상태
  const [paymentWidgetReady, setPaymentWidgetReady] = useState(false)
  const paymentWidgetRef = useRef<any>(null)

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
        const items = await getCartItemsClient(cartItems)
        setCartItemsWithData(items)

        if (items.length === 0) {
          router.push('/cart')
          return
        }

        // 기본 배송지 로드
        const result = await getDefaultShippingInfo()
        setAuthStatus(result.status)

        if (result.shippingInfo) {
          setShippingInfo((prev) => ({
            ...prev,
            ...result.shippingInfo,
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

  // TossPayments 위젯 초기화 (장바구니 로드 완료 후)
  useEffect(() => {
    if (cartItemsWithData.length === 0 || isLoading) return
    if (paymentWidgetRef.current) return // 이미 초기화됨

    const subtotal = cartItemsWithData.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    )
    const shippingFee = subtotal >= 50000 ? 0 : 3000
    const total = subtotal + shippingFee

    const initWidget = async () => {
      try {
        const { loadTossPayments, ANONYMOUS } = await import('@tosspayments/tosspayments-sdk')
        const clientKey = process.env.NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY || ''

        if (!clientKey) {
          console.warn('[TossPayments] NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY가 설정되지 않았습니다.')
          return
        }

        const tossPayments = await loadTossPayments(clientKey)
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS })

        paymentWidgetRef.current = widgets

        await widgets.setAmount({ currency: 'KRW', value: total })

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#payment-method-widget',
            variantKey: 'DEFAULT',
          }),
          widgets.renderAgreement({
            selector: '#payment-agreement-widget',
            variantKey: 'AGREEMENT',
          }),
        ])

        setPaymentWidgetReady(true)
      } catch (err) {
        console.error('[TossPayments] Widget init failed:', err)
      }
    }

    initWidget()
  }, [cartItemsWithData, isLoading])

  const formatPhoneNumber = (value: string) => {
    const nums = value.replace(/\D/g, '')
    if (nums.length <= 3) return nums
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ShippingInfo, string>> = {}

    if (!shippingInfo.name.trim()) errors.name = '이름을 입력해주세요'
    if (!shippingInfo.phone.trim()) {
      errors.phone = '연락처를 입력해주세요'
    } else if (shippingInfo.phone.replace(/\D/g, '').length < 10) {
      errors.phone = '올바른 전화번호를 입력해주세요'
    }
    if (!shippingInfo.address.trim()) errors.address = '주소를 입력해주세요'
    if (!shippingInfo.postalCode.trim()) {
      errors.postalCode = '우편번호를 입력해주세요'
    } else if (!/^\d{5}$/.test(shippingInfo.postalCode.trim())) {
      errors.postalCode = '5자리 우편번호를 입력해주세요'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    if (field === 'phone') {
      value = formatPhoneNumber(value)
    }
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAddressComplete = useCallback(
    (result: { postalCode: string; address: string }) => {
      setShippingInfo((prev) => ({
        ...prev,
        postalCode: result.postalCode,
        address: result.address,
      }))
      setFormErrors((prev) => ({
        ...prev,
        postalCode: undefined,
        address: undefined,
      }))
    },
    []
  )

  const handleCheckout = async () => {
    if (cartItemsWithData.length === 0) return
    if (!validateForm()) return

    if (!paymentWidgetRef.current) {
      setError('결제 모듈이 로딩 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      if (saveAsDefault && authStatus !== 'guest') {
        await saveDefaultShippingInfo(shippingInfo)
      }

      // 1. 결제 대기 주문 생성 (orderId = DB orders.id)
      const { orderId } = await createPendingOrder(cartItemsWithData, shippingInfo)

      // 2. TossPayments 결제 요청 (사용자가 결제수단 선택 후 결제 진행)
      const orderName =
        cartItemsWithData.length === 1
          ? cartItemsWithData[0].product.name
          : `${cartItemsWithData[0].product.name} 외 ${cartItemsWithData.length - 1}건`

      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: shippingInfo.name,
        customerMobilePhone: shippingInfo.phone.replace(/-/g, ''),
      })
      // 결제 진행 중 (TossPayments가 페이지를 리다이렉트)
    } catch (err: any) {
      // 사용자가 취소하거나 오류 발생
      if (err?.code !== 'USER_CANCEL' && err?.code !== 'PAY_PROCESS_CANCELED') {
        setError(err.message || '결제 처리 중 오류가 발생했습니다')
      }
      setIsProcessing(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto" />
          <div className="h-64 bg-gray-100 rounded" />
          <div className="h-40 bg-gray-100 rounded" />
        </div>
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
  const shippingFee = subtotal >= 50000 ? 0 : 3000
  const total = subtotal + shippingFee

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">주문 / 결제</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 왼쪽: 배송 정보 + 결제 위젯 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 배너: 3분기 조건 */}
          {authStatus === 'guest' && (
            <div className="bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-800 font-medium">
                비회원 주문이 가능합니다. 결제 후 주문번호로 배송조회가 가능해요.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                <Link href="/auth/login?redirect=/checkout" className="underline font-semibold">
                  로그인
                </Link>
                하시면 기본 배송지 자동입력, 주문관리가 더 편리합니다.
              </p>
            </div>
          )}

          {authStatus === 'logged_in_with_address' && (
            <div className="bg-green-50 border border-green-200 p-3">
              <p className="text-sm text-green-800">
                기본 배송지가 자동으로 입력되었습니다.
              </p>
            </div>
          )}

          {authStatus === 'logged_in_no_address' && (
            <div className="bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800">
                기본 배송지를 등록하면 다음 주문부터 자동으로 입력됩니다.{' '}
                <Link href="/account" className="underline font-semibold">
                  내 계정에서 등록하기
                </Link>
              </p>
            </div>
          )}

          <div className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-4">배송 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  수령인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2.5 border-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:border-black outline-none`}
                  placeholder="수령인 이름"
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  maxLength={13}
                  className={`w-full px-3 py-2.5 border-2 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-black outline-none`}
                  placeholder="010-0000-0000"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>

              {/* 우편번호 + 주소검색 */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  우편번호 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shippingInfo.postalCode}
                    readOnly
                    className={`flex-1 px-3 py-2.5 border-2 ${formErrors.postalCode ? 'border-red-500' : 'border-gray-300'} bg-gray-50 outline-none`}
                    placeholder="주소 검색을 눌러주세요"
                  />
                  <AddressSearch onComplete={handleAddressComplete} />
                </div>
                {formErrors.postalCode && <p className="text-red-500 text-xs mt-1">{formErrors.postalCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingInfo.address}
                  readOnly
                  className={`w-full px-3 py-2.5 border-2 ${formErrors.address ? 'border-red-500' : 'border-gray-300'} bg-gray-50 outline-none`}
                  placeholder="주소 검색 버튼을 눌러주세요"
                />
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">상세 주소</label>
                <input
                  type="text"
                  value={shippingInfo.addressDetail}
                  onChange={(e) => handleInputChange('addressDetail', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 focus:border-black outline-none"
                  placeholder="아파트, 동/호수 등"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">배송 메모</label>
                <select
                  value={shippingInfo.memo}
                  onChange={(e) => handleInputChange('memo', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 focus:border-black outline-none bg-white"
                >
                  <option value="">배송 메모를 선택해주세요</option>
                  <option value="부재시 문앞에 놓아주세요">부재시 문앞에 놓아주세요</option>
                  <option value="부재시 경비실에 맡겨주세요">부재시 경비실에 맡겨주세요</option>
                  <option value="배송 전 연락 부탁드립니다">배송 전 연락 부탁드립니다</option>
                  <option value="직접입력">직접 입력</option>
                </select>
                {shippingInfo.memo === '직접입력' && (
                  <input
                    type="text"
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, memo: e.target.value || '직접입력' }))}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 focus:border-black outline-none mt-2"
                    placeholder="배송 메모를 입력해주세요"
                    autoFocus
                  />
                )}
              </div>

              {/* 기본 배송지로 저장 (로그인 사용자만) */}
              {authStatus !== 'guest' && authStatus !== null && (
                <label className="flex items-center gap-2 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">기본 배송지로 저장</span>
                </label>
              )}
            </div>
          </div>

          {/* TossPayments 결제 위젯 */}
          <div className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-4">결제 수단</h2>
            {!paymentWidgetReady && (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-10 justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black flex-shrink-0" />
                결제 수단을 불러오는 중...
              </div>
            )}
            {/* TossPayments 결제수단 선택 위젯 렌더링 대상 */}
            <div id="payment-method-widget" />
            {/* TossPayments 약관 동의 위젯 렌더링 대상 */}
            <div id="payment-agreement-widget" className="mt-4" />
          </div>
        </div>

        {/* 오른쪽: 주문 요약 (sticky) */}
        <div className="lg:col-span-2">
          <div className="border-2 border-black p-6 lg:sticky lg:top-4">
            <h2 className="text-xl font-bold mb-4">주문 요약</h2>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cartItemsWithData.map((item) => (
                <div key={item.variant_id} className="flex gap-3 text-sm">
                  {item.image_url && (
                    <div className="w-14 h-14 relative bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <p className="text-gray-500 text-xs">
                      {item.variant.color} / {item.variant.size} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold flex-shrink-0">
                    {formatPrice(item.variant.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">상품 금액</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배송비</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-medium">무료</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-gray-400">
                  {formatPrice(50000 - subtotal)} 더 구매 시 무료배송
                </p>
              )}
            </div>

            <div className="border-t-2 border-black pt-4 mt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>총 결제금액</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={isProcessing || !paymentWidgetReady}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  결제 처리 중...
                </span>
              ) : !paymentWidgetReady ? (
                '결제 수단 로딩 중...'
              ) : (
                `${formatPrice(total)} 결제하기`
              )}
            </Button>

            <Link href="/cart" className="block mt-3">
              <Button variant="outline" className="w-full" size="sm">
                장바구니로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
