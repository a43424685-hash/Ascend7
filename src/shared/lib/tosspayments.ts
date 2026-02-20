/**
 * TossPayments 서버 사이드 API 헬퍼
 * 결제 승인(confirm), 환불(cancel) 처리
 */

const TOSSPAYMENTS_BASE_URL = 'https://api.tosspayments.com'

function getAuthHeader(): string {
  const secretKey = process.env.TOSSPAYMENTS_SECRET_KEY
  if (!secretKey) {
    throw new Error('TOSSPAYMENTS_SECRET_KEY가 설정되지 않았습니다.')
  }
  const encoded = Buffer.from(`${secretKey}:`).toString('base64')
  return `Basic ${encoded}`
}

/**
 * 결제 승인
 * 성공 URL에서 받은 paymentKey, orderId, amount로 TossPayments 서버에 최종 승인 요청
 */
export async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number
) {
  const res = await fetch(`${TOSSPAYMENTS_BASE_URL}/v1/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || `결제 승인 실패 (${res.status})`)
  }

  return data
}

/**
 * 결제 취소(환불)
 * cancelAmount를 생략하면 전액 환불
 */
export async function cancelTossPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number
) {
  const body: Record<string, any> = { cancelReason }
  if (cancelAmount !== undefined) {
    body.cancelAmount = cancelAmount
  }

  const res = await fetch(
    `${TOSSPAYMENTS_BASE_URL}/v1/payments/${paymentKey}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || `환불 처리 실패 (${res.status})`)
  }

  return data
}
