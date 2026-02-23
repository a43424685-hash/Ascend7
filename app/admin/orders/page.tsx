import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { checkAdminAuth } from '@/shared/lib/auth/admin'
import { OrdersListEnhanced } from '@/widgets/admin/orders-list-enhanced'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) {
    redirect('/')
  }

  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      user_id,
      payment_status,
      fulfillment_status,
      total,
      stripe_session_id,
      tracking_number,
      carrier,
      customer_email,
      customer_name,
      customer_phone,
      shipping_address,
      created_at,
      return_status,
      return_reason,
      return_inspection_notes,
      return_rejection_reason,
      return_requested_at,
      refunded_at,
      stripe_refund_id,
      refund_amount,
      order_items (
        id,
        quantity,
        price,
        variant:variants (
          id,
          sku,
          color,
          size,
          product:products (
            id,
            name,
            slug
          )
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch orders:', error)
    return (
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold mb-4">주문 관리</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold mb-1 text-sm">오류 발생</p>
          <p className="text-red-600 text-xs">{error.message}</p>
        </div>
      </div>
    )
  }

  const normalizedOrders = (orders ?? []).map((o: any) => ({
    ...o,
    order_items: (o.order_items ?? []).map((oi: any) => {
      const variant = Array.isArray(oi.variant) ? oi.variant[0] : oi.variant;
      const product = variant && Array.isArray(variant.product) ? variant.product[0] : variant?.product;

      return {
        ...oi,
        variant: variant
          ? {
              ...variant,
              product: product ?? null,
            }
          : null,
      };
    }),
  }));

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">주문 관리</h1>
        <p className="text-xs sm:text-sm text-gray-500">전체 주문 관리 - 결제/배송 상태 변경 및 운송장 입력</p>
      </div>
      <OrdersListEnhanced orders={normalizedOrders} />
    </div>
  )
}
