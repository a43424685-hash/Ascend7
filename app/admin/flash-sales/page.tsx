import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { checkAdminAuth } from '@/shared/lib/auth/admin'
import { formatPrice } from '@/shared/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminFlashSalesPage() {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) redirect('/')

  const supabase = createAdminClient()

  const { data: sales } = await supabase
    .from('flash_sales')
    .select(`
      id, title, sale_price, original_price, discount_percent,
      end_at, max_quantity, sold_quantity, is_active,
      product:products (id, name, slug),
      variant:variants (id, color, size)
    `)
    .order('created_at', { ascending: false })

  const now = new Date()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">플래시 세일 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">타임딜 / 한정 수량 세일 관리</p>
        </div>
        <Link
          href="/admin/flash-sales/new"
          className="bg-black text-white text-sm px-4 py-2 hover:bg-gray-800 transition-colors"
        >
          + 플래시 세일 추가
        </Link>
      </div>

      {(!sales || sales.length === 0) ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200">
          <p className="text-gray-400 mb-2">등록된 플래시 세일이 없습니다</p>
          <Link href="/admin/flash-sales/new" className="text-sm underline">추가하기</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(sales as any[]).map((sale) => {
            const product = Array.isArray(sale.product) ? sale.product[0] : sale.product
            const variant = Array.isArray(sale.variant) ? sale.variant[0] : sale.variant
            const endAt = new Date(sale.end_at)
            const isExpired = endAt < now
            const isActive = sale.is_active && !isExpired

            return (
              <div key={sale.id} className="border border-gray-200 p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 font-medium ${
                      isActive ? 'bg-green-100 text-green-700' :
                      isExpired ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {isActive ? '진행 중' : isExpired ? '종료' : '비활성'}
                    </span>
                    <h3 className="font-semibold text-sm truncate">{sale.title}</h3>
                  </div>
                  {product && (
                    <p className="text-xs text-gray-500 mb-1">
                      {product.name}
                      {variant && ` — ${variant.color} / ${variant.size}`}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      <span className="font-semibold text-red-600">{formatPrice(sale.sale_price)}</span>
                      <span className="line-through ml-1">{formatPrice(sale.original_price)}</span>
                      <span className="text-yellow-600 ml-1">-{sale.discount_percent}%</span>
                    </span>
                    <span>|</span>
                    <span>
                      {sale.max_quantity !== null ? `${sale.sold_quantity}/${sale.max_quantity}개 판매` : '무제한'}
                    </span>
                    <span>|</span>
                    <span>종료: {endAt.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
