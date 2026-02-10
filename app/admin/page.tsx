import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { createClient } from '@/shared/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()

  // 재고 부족 상품 조회 (재고 10개 미만)
  const { data: lowStockVariants } = await supabase
    .from('variants')
    .select(`
      id,
      sku,
      color,
      size,
      stock,
      price,
      product:products (
        id,
        name,
        slug
      )
    `)
    .eq('is_active', true)
    .lt('stock', 10)
    .order('stock', { ascending: true })
    .limit(5)

  // 최근 주문 통계
  const { count: todayOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date().toISOString().split('T')[0])

  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white border-2 border-black">
          <p className="text-sm text-gray-600 mb-1">오늘 주문</p>
          <p className="text-3xl font-bold">{todayOrders || 0}</p>
        </div>
        <div className="p-4 bg-white border-2 border-orange-500">
          <p className="text-sm text-gray-600 mb-1">대기 중 주문</p>
          <p className="text-3xl font-bold text-orange-600">{pendingOrders || 0}</p>
        </div>
        <div className="p-4 bg-white border-2 border-red-500">
          <p className="text-sm text-gray-600 mb-1">재고 부족 상품</p>
          <p className="text-3xl font-bold text-red-600">{lowStockVariants?.length || 0}</p>
        </div>
      </div>

      {/* 재고 부족 알림 */}
      {lowStockVariants && lowStockVariants.length > 0 && (
        <div className="mb-8 p-4 bg-red-50 border-2 border-red-200">
          <h2 className="text-lg font-bold text-red-800 mb-3">⚠️ 재고 부족 알림</h2>
          <div className="space-y-2">
            {lowStockVariants.map((variant: any) => (
              <div key={variant.id} className="flex justify-between items-center text-sm">
                <div>
                  <Link
                    href={`/admin/products/${variant.product.id}`}
                    className="font-semibold hover:underline"
                  >
                    {variant.product.name}
                  </Link>
                  <span className="text-gray-600 ml-2">
                    ({variant.color} / {variant.size})
                  </span>
                </div>
                <span className={`font-bold ${variant.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  재고: {variant.stock}개
                </span>
              </div>
            ))}
          </div>
          <Link href="/admin/products" className="mt-3 inline-block">
            <Button variant="outline" size="sm">
              재고 관리하기 →
            </Button>
          </Link>
        </div>
      )}

      {/* 메인 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products Card */}
        <Link
          href="/admin/products"
          className="block p-6 bg-white border-2 border-gray-200 hover:border-black transition-colors"
        >
          <h2 className="text-xl font-bold mb-2">Products</h2>
          <p className="text-gray-600 mb-4">
            Manage products, variants, and inventory
          </p>
          <Button variant="outline">Manage Products →</Button>
        </Link>

        {/* Orders Card */}
        <Link
          href="/admin/orders"
          className="block p-6 bg-white border-2 border-gray-200 hover:border-black transition-colors"
        >
          <h2 className="text-xl font-bold mb-2">Orders</h2>
          <p className="text-gray-600 mb-4">View and manage customer orders</p>
          <Button variant="outline">View Orders →</Button>
        </Link>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is an MVP admin interface. All security is enforced at the database level via Row Level Security (RLS).
        </p>
      </div>
    </div>
  )
}
