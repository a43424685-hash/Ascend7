import type { SupabaseClient } from '@supabase/supabase-js'
import { formatPrice } from '@/shared/lib/utils'
import type { EmailOrderData } from '@/shared/lib/email'

/**
 * 이메일 발송용 주문 데이터 조회 공통 헬퍼
 * confirm/route.ts, update-order-fulfillment.ts, return-management.ts에서 공용 사용
 */
export async function fetchEmailOrderData(
  supabase: SupabaseClient,
  orderId: string,
  extra?: Partial<EmailOrderData>
): Promise<EmailOrderData | null> {
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, customer_email, customer_name, total')
    .eq('id', orderId)
    .single()

  if (!order?.customer_email) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('quantity, price, variant:variants(color, size, product:products(name))')
    .eq('order_id', orderId)

  return {
    orderNumber: order.order_number || orderId.slice(0, 8),
    customerName: order.customer_name || '고객',
    customerEmail: order.customer_email,
    total: formatPrice(order.total),
    items: (items || []).map((item: any) => {
      const v = Array.isArray(item.variant) ? item.variant[0] : item.variant
      const p = v && (Array.isArray(v.product) ? v.product[0] : v.product)
      return {
        name: p?.name || '상품',
        option: v ? `${v.color} / ${v.size}` : '-',
        quantity: item.quantity,
        price: formatPrice(item.price * item.quantity),
      }
    }),
    ...extra,
  }
}
