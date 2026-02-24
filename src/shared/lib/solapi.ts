/**
 * Solapi 카카오 알림톡 발송 라이브러리
 *
 * 필요한 Vercel 환경변수:
 * - SOLAPI_API_KEY
 * - SOLAPI_API_SECRET
 * - SOLAPI_SENDER_NUMBER (발신번호, 예: 01098095148)
 * - SOLAPI_KAKAO_CHANNEL_ID (Solapi 콘솔의 pfId, 예: KA01PF...)
 * - SOLAPI_TEMPLATE_ORDER_CONFIRM (주문완료 템플릿 ID, 심사 승인 후 등록)
 * - SOLAPI_TEMPLATE_SHIPPING      (배송시작 템플릿 ID, 심사 승인 후 등록)
 * - SOLAPI_TEMPLATE_ORDER_CANCEL  (주문취소 템플릿 ID, 심사 승인 후 등록)
 */

import crypto from 'crypto'

const SOLAPI_API_URL = 'https://api.solapi.com/messages/v4/send'

function generateAuthHeader(): string {
  const apiKey = process.env.SOLAPI_API_KEY
  const apiSecret = process.env.SOLAPI_API_SECRET
  if (!apiKey || !apiSecret) throw new Error('Solapi API credentials not configured')

  const date = new Date().toISOString()
  const salt = crypto.randomBytes(16).toString('hex')
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex')

  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
}

async function sendAlimtalk(
  to: string,
  templateId: string,
  variables: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const pfId = process.env.SOLAPI_KAKAO_CHANNEL_ID
  const from = process.env.SOLAPI_SENDER_NUMBER

  if (!pfId || !from) {
    console.warn('⚠️ [ALIMTALK] Kakao channel ID or sender number not configured')
    return { success: false, error: 'Kakao config missing' }
  }

  if (!templateId) {
    console.warn('⚠️ [ALIMTALK] Template ID not configured')
    return { success: false, error: 'Template ID missing' }
  }

  // 수신번호 정규화 (숫자만)
  const toNormalized = to.replace(/\D/g, '')
  if (toNormalized.length < 10) {
    return { success: false, error: 'Invalid phone number' }
  }

  try {
    const res = await fetch(SOLAPI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: generateAuthHeader(),
      },
      body: JSON.stringify({
        message: {
          to: toNormalized,
          from: from.replace(/\D/g, ''),
          kakaoOptions: {
            pfId,
            templateId,
            variables,
          },
        },
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      console.error('❌ [ALIMTALK] Send failed:', json)
      return { success: false, error: json?.errorMessage || 'Send failed' }
    }

    console.log('✅ [ALIMTALK] Sent to', toNormalized)
    return { success: true }
  } catch (err: any) {
    console.error('❌ [ALIMTALK] Exception:', err.message)
    return { success: false, error: err.message }
  }
}

/* ────────────────────────────────────
 * 1. 주문 완료 알림톡
 * ──────────────────────────────────── */
export async function sendOrderConfirmAlimtalk(params: {
  to: string
  customerName: string
  orderNumber: string
  orderTotal: string
  productSummary: string // 첫 번째 상품명 (외 N건)
}) {
  const templateId = process.env.SOLAPI_TEMPLATE_ORDER_CONFIRM || ''
  return sendAlimtalk(params.to, templateId, {
    '#{고객명}': params.customerName,
    '#{주문번호}': params.orderNumber,
    '#{주문금액}': params.orderTotal,
    '#{상품명}': params.productSummary,
  })
}

/* ────────────────────────────────────
 * 2. 배송 시작 알림톡
 * ──────────────────────────────────── */
export async function sendShippingAlimtalk(params: {
  to: string
  customerName: string
  orderNumber: string
  carrier: string
  trackingNumber: string
}) {
  const templateId = process.env.SOLAPI_TEMPLATE_SHIPPING || ''
  return sendAlimtalk(params.to, templateId, {
    '#{고객명}': params.customerName,
    '#{주문번호}': params.orderNumber,
    '#{택배사}': params.carrier,
    '#{운송장번호}': params.trackingNumber,
  })
}

/* ────────────────────────────────────
 * 3. 주문 취소 알림톡
 * ──────────────────────────────────── */
export async function sendOrderCancelAlimtalk(params: {
  to: string
  customerName: string
  orderNumber: string
  refundAmount: string
}) {
  const templateId = process.env.SOLAPI_TEMPLATE_ORDER_CANCEL || ''
  return sendAlimtalk(params.to, templateId, {
    '#{고객명}': params.customerName,
    '#{주문번호}': params.orderNumber,
    '#{환불금액}': params.refundAmount,
  })
}
