import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const STOCK_THRESHOLD = 5 // 재고 5개 이하 시 알림
const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL || process.env.FROM_EMAIL?.match(/<(.+)>/)?.[1] || ''

/**
 * 재고 부족 알림 Cron Job
 * - 매일 오전 9시 KST (0 0 * * * UTC) 실행
 * - 재고 5개 이하 상품 관리자 이메일 발송
 */
export async function GET(req: NextRequest) {
  // CRON_SECRET 미설정 시 fail-secure (undefined 우회 방지)
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: lowStockVariants, error } = await supabase
    .from('variants')
    .select('id, sku, color, size, stock, product:products(name, slug)')
    .eq('is_active', true)
    .lte('stock', STOCK_THRESHOLD)
    .order('stock', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!lowStockVariants || lowStockVariants.length === 0) {
    return NextResponse.json({ success: true, message: '재고 부족 상품 없음' })
  }

  // 이메일 발송
  if (process.env.RESEND_API_KEY && ADMIN_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const rows = lowStockVariants.map((v: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${v.product?.name || '-'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${v.color} / ${v.size}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-family:monospace">${v.sku || '-'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;font-weight:700;color:${v.stock === 0 ? '#dc2626' : '#d97706'}">${v.stock}개</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;background:#f9fafb;padding:40px 0">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e5e7eb;margin:0 auto;max-width:600px">
  <tr><td style="padding:24px 32px;border-bottom:2px solid #000;text-align:center">
    <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:2px">ASCEND7</h1>
    <p style="margin:4px 0 0;font-size:12px;color:#6b7280">재고 부족 알림</p>
  </td></tr>
  <tr><td style="padding:24px 32px">
    <h2 style="margin:0 0 8px;font-size:16px">재고 ${STOCK_THRESHOLD}개 이하 상품 ${lowStockVariants.length}건</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#6b7280">${new Date().toLocaleDateString('ko-KR')} 기준</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr style="background:#f9fafb">
        <th style="padding:8px 12px;text-align:left;font-size:12px">상품명</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px">옵션</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px">SKU</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px">재고</th>
      </tr>
      ${rows}
    </table>
    <div style="margin-top:20px;text-align:center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/products" style="display:inline-block;padding:10px 24px;background:#000;color:#fff;text-decoration:none;font-size:13px">재고 관리하기 →</a>
    </div>
  </td></tr>
</table>
</body></html>`

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'ASCEND7 <noreply@ascend7.kr>',
      to: ADMIN_EMAIL,
      subject: `[ASCEND7] 재고 부족 알림 - ${lowStockVariants.length}개 상품`,
      html,
    })

    console.log(`✅ [LOW_STOCK_CRON] Alert sent: ${lowStockVariants.length} items`)
  }

  return NextResponse.json({
    success: true,
    count: lowStockVariants.length,
    items: lowStockVariants.map((v: any) => ({
      name: v.product?.name,
      option: `${v.color}/${v.size}`,
      stock: v.stock,
    })),
  })
}
