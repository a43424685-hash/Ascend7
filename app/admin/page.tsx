import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'

export const dynamic = 'force-dynamic'

function formatKRW(amount: number) {
  return new Intl.NumberFormat('ko-KR').format(amount)
}

export default async function AdminPage() {
  const supabase = await createClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // 모든 쿼리 병렬 실행
  const [
    todayOrdersRes,
    weekOrdersRes,
    monthOrdersRes,
    pendingOrdersRes,
    processingOrdersRes,
    shippedOrdersRes,
    recentOrdersRes,
    lowStockRes,
    totalProductsRes,
    returnRequestsRes,
  ] = await Promise.all([
    // 오늘 주문 (매출 포함)
    supabase
      .from('orders')
      .select('total')
      .gte('created_at', todayStart)
      .eq('payment_status', 'paid'),
    // 이번 주 주문
    supabase
      .from('orders')
      .select('total')
      .gte('created_at', weekStart)
      .eq('payment_status', 'paid'),
    // 이번 달 주문
    supabase
      .from('orders')
      .select('total')
      .gte('created_at', monthStart)
      .eq('payment_status', 'paid'),
    // 대기 중 주문
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('fulfillment_status', 'unfulfilled')
      .eq('payment_status', 'paid'),
    // 처리 중 주문
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('fulfillment_status', 'processing'),
    // 배송 중 주문
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('fulfillment_status', 'shipped'),
    // 최근 주문 5건
    supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, total, payment_status, fulfillment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    // 재고 부족 상품
    supabase
      .from('variants')
      .select('id, sku, color, size, stock, price, product:products(id, name, slug)')
      .eq('is_active', true)
      .lt('stock', 10)
      .order('stock', { ascending: true })
      .limit(8),
    // 총 상품 수
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    // 반품 요청
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('return_status', 'requested'),
  ])

  const todayOrders = todayOrdersRes.data || []
  const weekOrders = weekOrdersRes.data || []
  const monthOrders = monthOrdersRes.data || []
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const recentOrders = recentOrdersRes.data || []
  const lowStockVariants = lowStockRes.data || []

  const fulfillmentLabel: Record<string, string> = {
    unfulfilled: '미처리',
    processing: '처리중',
    shipped: '배송중',
    delivered: '배송완료',
    canceled: '취소',
  }

  const paymentLabel: Record<string, string> = {
    pending: '결제대기',
    paid: '결제완료',
    failed: '결제실패',
    refunded: '환불완료',
  }

  return (
    <div className="space-y-8">
      {/* 페이지 타이틀 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">
          {now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 매출 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">오늘 매출</p>
          <p className="text-2xl font-bold mt-2">{formatKRW(todayRevenue)}원</p>
          <p className="text-xs text-gray-400 mt-1">{todayOrders.length}건</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">이번 주</p>
          <p className="text-2xl font-bold mt-2">{formatKRW(weekRevenue)}원</p>
          <p className="text-xs text-gray-400 mt-1">{weekOrders.length}건</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">이번 달</p>
          <p className="text-2xl font-bold mt-2">{formatKRW(monthRevenue)}원</p>
          <p className="text-xs text-gray-400 mt-1">{monthOrders.length}건</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">등록 상품</p>
          <p className="text-2xl font-bold mt-2">{totalProductsRes.count || 0}</p>
          <p className="text-xs text-gray-400 mt-1">활성 상품</p>
        </div>
      </div>

      {/* 주문 상태 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/orders"
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-amber-700">미처리</p>
            <span className="text-lg">📦</span>
          </div>
          <p className="text-3xl font-bold text-amber-800 mt-1">{pendingOrdersRes.count || 0}</p>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-blue-700">처리중</p>
            <span className="text-lg">⚙️</span>
          </div>
          <p className="text-3xl font-bold text-blue-800 mt-1">{processingOrdersRes.count || 0}</p>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 hover:border-indigo-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-indigo-700">배송중</p>
            <span className="text-lg">🚚</span>
          </div>
          <p className="text-3xl font-bold text-indigo-800 mt-1">{shippedOrdersRes.count || 0}</p>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-rose-50 border border-rose-200 rounded-xl p-4 hover:border-rose-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-rose-700">반품 요청</p>
            <span className="text-lg">↩️</span>
          </div>
          <p className="text-3xl font-bold text-rose-800 mt-1">{returnRequestsRes.count || 0}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 주문 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">최근 주문</h2>
            <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-black transition-colors">
              전체보기 →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                아직 주문이 없습니다
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">#{order.order_number}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        order.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : order.payment_status === 'refunded'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {paymentLabel[order.payment_status] || order.payment_status}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        order.fulfillment_status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.fulfillment_status === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : order.fulfillment_status === 'unfulfilled'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {fulfillmentLabel[order.fulfillment_status] || order.fulfillment_status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {order.customer_name || order.customer_email || '게스트'}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold">{formatKRW(order.total)}원</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* 재고 부족 알림 */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold">재고 부족</h2>
            <Link href="/admin/products" className="text-xs text-gray-500 hover:text-black transition-colors">
              재고관리 →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStockVariants.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                재고 부족 상품 없음
              </div>
            ) : (
              lowStockVariants.map((variant: any) => (
                <Link
                  key={variant.id}
                  href={`/admin/products/${variant.product?.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{variant.product?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {variant.color} / {variant.size}
                    </p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ml-3 ${
                    variant.stock === 0 ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {variant.stock}개
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 빠른 이동 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-black transition-colors group"
        >
          <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-lg group-hover:scale-105 transition-transform">+</div>
          <div>
            <p className="text-sm font-bold">새 상품 등록</p>
            <p className="text-xs text-gray-500">상품을 추가하고 옵션을 설정합니다</p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:border-black transition-colors group"
        >
          <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-lg group-hover:scale-105 transition-transform">→</div>
          <div>
            <p className="text-sm font-bold">주문 처리</p>
            <p className="text-xs text-gray-500">미처리 주문을 확인하고 발송합니다</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
