import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'ASCEND7 <onboarding@resend.dev>'
const SITE_NAME = 'ASCEND7'

/* ────────────────────────────────────────────
 * 공용 HTML 레이아웃
 * ──────────────────────────────────────────── */
function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e5e7eb;max-width:600px;width:100%">
  <tr><td style="padding:32px 32px 24px;border-bottom:2px solid #000;text-align:center">
    <h1 style="margin:0;font-size:20px;font-weight:800;letter-spacing:2px">${SITE_NAME}</h1>
  </td></tr>
  <tr><td style="padding:32px">${body}</td></tr>
  <tr><td style="padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center">
    <p style="margin:0;font-size:12px;color:#9ca3af">본 메일은 발신 전용입니다.</p>
    <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
}

/* 상품 요약 행 */
function itemRow(name: string, option: string, qty: number, price: string) {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #f3f4f6">
      <strong style="font-size:14px">${name}</strong>
      <br><span style="font-size:12px;color:#6b7280">${option} × ${qty}</span>
    </td>
    <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-size:14px;font-weight:600">${price}</td>
  </tr>`
}

/* ────────────────────────────────────────────
 * 메일 타입별 데이터
 * ──────────────────────────────────────────── */
export interface OrderItem {
  name: string
  option: string
  quantity: number
  price: string
}

export interface EmailOrderData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: string
  trackingNumber?: string
  carrier?: string
  refundAmount?: string
  returnReason?: string
}

/* ────────────────────────────────────────────
 * 1. 주문 완료
 * ──────────────────────────────────────────── */
export async function sendOrderConfirmation(data: EmailOrderData) {
  const itemsHtml = data.items
    .map((i) => itemRow(i.name, i.option, i.quantity, i.price))
    .join('')

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px">주문이 완료되었습니다</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">${data.customerName}님, 감사합니다.</p>
    <table width="100%" style="margin-bottom:24px">
      <tr><td style="background:#f9fafb;padding:12px;font-size:13px">
        <strong>주문번호</strong>&nbsp;&nbsp;<span style="font-family:monospace;font-weight:700">${data.orderNumber}</span>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="padding:8px 0;border-bottom:2px solid #000;font-size:13px;font-weight:700">상품</td>
          <td style="padding:8px 0;border-bottom:2px solid #000;font-size:13px;font-weight:700;text-align:right">금액</td></tr>
      ${itemsHtml}
      <tr><td style="padding:12px 0;font-size:15px;font-weight:700">합계</td>
          <td style="padding:12px 0;font-size:15px;font-weight:700;text-align:right">${data.total}</td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280">결제가 정상적으로 처리되었으며, 상품 준비 후 배송이 시작됩니다.</p>
    <p style="margin:0;font-size:13px;color:#6b7280">배송 시작 시 운송장 번호가 안내됩니다.</p>`

  return sendEmail(data.customerEmail, `[${SITE_NAME}] 주문 완료 (${data.orderNumber})`, layout('주문 완료', body))
}

/* ────────────────────────────────────────────
 * 2. 배송 시작
 * ──────────────────────────────────────────── */
export async function sendShippingNotification(data: EmailOrderData) {
  const itemsHtml = data.items
    .map((i) => itemRow(i.name, i.option, i.quantity, i.price))
    .join('')

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px">배송이 시작되었습니다</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">${data.customerName}님의 주문 상품이 발송되었습니다.</p>
    <table width="100%" style="margin-bottom:24px">
      <tr><td style="background:#f9fafb;padding:12px;font-size:13px">
        <strong>주문번호</strong>&nbsp;&nbsp;<span style="font-family:monospace;font-weight:700">${data.orderNumber}</span>
        <br><strong>택배사</strong>&nbsp;&nbsp;${data.carrier || '택배'}
        <br><strong>운송장</strong>&nbsp;&nbsp;<span style="font-family:monospace">${data.trackingNumber || '-'}</span>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="padding:8px 0;border-bottom:2px solid #000;font-size:13px;font-weight:700">상품</td>
          <td style="padding:8px 0;border-bottom:2px solid #000;font-size:13px;font-weight:700;text-align:right">금액</td></tr>
      ${itemsHtml}
    </table>
    <p style="margin:0;font-size:13px;color:#6b7280">배송 완료까지 1~3 영업일이 소요될 수 있습니다.</p>`

  return sendEmail(data.customerEmail, `[${SITE_NAME}] 배송 시작 (${data.orderNumber})`, layout('배송 시작', body))
}

/* ────────────────────────────────────────────
 * 3. 환불 완료
 * ──────────────────────────────────────────── */
export async function sendRefundConfirmation(data: EmailOrderData) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px">환불이 완료되었습니다</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">${data.customerName}님, 환불 처리가 완료되었습니다.</p>
    <table width="100%" style="margin-bottom:24px">
      <tr><td style="background:#f9fafb;padding:12px;font-size:13px">
        <strong>주문번호</strong>&nbsp;&nbsp;<span style="font-family:monospace;font-weight:700">${data.orderNumber}</span>
        <br><strong>환불 금액</strong>&nbsp;&nbsp;<span style="font-weight:700;color:#7c3aed">${data.refundAmount || data.total}</span>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280">환불 금액은 결제 수단에 따라 3~5 영업일 내에 반영됩니다.</p>
    <p style="margin:0;font-size:13px;color:#6b7280">이용해 주셔서 감사합니다.</p>`

  return sendEmail(data.customerEmail, `[${SITE_NAME}] 환불 완료 (${data.orderNumber})`, layout('환불 완료', body))
}

/* ────────────────────────────────────────────
 * 4. 반품 접수
 * ──────────────────────────────────────────── */
export async function sendReturnRequestConfirmation(data: EmailOrderData) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px">반품 요청이 접수되었습니다</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">${data.customerName}님의 반품 요청이 접수되었습니다.</p>
    <table width="100%" style="margin-bottom:24px">
      <tr><td style="background:#f9fafb;padding:12px;font-size:13px">
        <strong>주문번호</strong>&nbsp;&nbsp;<span style="font-family:monospace;font-weight:700">${data.orderNumber}</span>
        ${data.returnReason ? `<br><strong>반품 사유</strong>&nbsp;&nbsp;${data.returnReason}` : ''}
      </td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280">반품 상품을 아래 주소로 보내주세요. 상품 도착 후 검수를 진행합니다.</p>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280">검수 완료 후 환불이 진행됩니다.</p>
    <p style="margin:0;font-size:12px;color:#9ca3af">※ 착용 흔적, 택 제거, 세탁/수선된 상품은 반품이 불가합니다.</p>`

  return sendEmail(data.customerEmail, `[${SITE_NAME}] 반품 접수 (${data.orderNumber})`, layout('반품 접수', body))
}

/* ────────────────────────────────────────────
 * 공용 전송 함수 (에러 로깅, 실패해도 throw 하지 않음)
 * ──────────────────────────────────────────── */
async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ [EMAIL] RESEND_API_KEY not set — skipping email:', subject)
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('❌ [EMAIL] Send failed:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ [EMAIL] Sent:', subject, '→', to, '| id:', data?.id)
    return { success: true, id: data?.id }
  } catch (err: any) {
    console.error('❌ [EMAIL] Exception:', err.message)
    return { success: false, error: err.message }
  }
}
