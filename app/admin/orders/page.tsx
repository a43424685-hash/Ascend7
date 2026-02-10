import { createClient } from '@/shared/lib/supabase/server'
import { OrdersList } from '@/widgets/admin/orders-list'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // 모든 주문 조회 (관리자는 모든 주문 볼 수 있음)
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      status,
      total,
      stripe_session_id,
      created_at,
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
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">ORDERS</h1>
        <div className="bg-red-50 border-2 border-red-200 p-6">
          <p className="text-red-800 font-semibold mb-2">오류 발생</p>
          <p className="text-red-600 text-sm">{error.message}</p>
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">ORDERS</h1>
      <OrdersList orders={normalizedOrders} />
    </div>
  )
}

