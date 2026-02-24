import Link from 'next/link'
import { getAllProductsAdmin } from '@/entities/product/api/get-all-products-admin'
import { Button } from '@/shared/ui/button'
import { formatPrice } from '@/shared/lib/utils'
import { ComingSoonToggle } from '@/widgets/admin/coming-soon-toggle'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">상품 관리</h1>
        <Link href="/admin/products/new">
          <Button>+ 새 상품</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600 mb-4 text-sm">등록된 상품이 없습니다</p>
          <Link href="/admin/products/new">
            <Button>첫 상품 등록하기</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* 모바일: 카드 레이아웃 */}
          <div className="sm:hidden space-y-3">
            {products.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
              const minPrice = Math.min(...product.variants.map((v) => v.price))
              return (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/admin/products/${product.id}`} className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatPrice(minPrice)} · {product.category}</p>
                      <p className="text-xs text-gray-400 mt-1">{product.variants.length}개 옵션 · 재고 {totalStock}</p>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.is_active ? '활성' : '비활성'}
                      </span>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-gray-400">준비중</span>
                        <ComingSoonToggle productId={product.id} initialValue={product.is_coming_soon ?? false} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 데스크탑: 테이블 레이아웃 */}
          <div className="hidden sm:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">상품</th>
                  <th className="text-left p-4 font-semibold text-sm">카테고리</th>
                  <th className="text-left p-4 font-semibold text-sm">옵션</th>
                  <th className="text-left p-4 font-semibold text-sm">상태</th>
                  <th className="text-center p-4 font-semibold text-sm">준비중</th>
                  <th className="text-right p-4 font-semibold text-sm">관리</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
                  const minPrice = Math.min(...product.variants.map((v) => v.price))
                  const maxPrice = Math.max(...product.variants.map((v) => v.price))

                  return (
                    <tr key={product.id} className="border-b border-gray-100">
                      <td className="p-4">
                        <div className="font-semibold text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {minPrice === maxPrice
                            ? formatPrice(minPrice)
                            : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                        </div>
                      </td>
                      <td className="p-4 text-sm capitalize">{product.category}</td>
                      <td className="p-4">
                        <div className="text-sm">{product.variants.length}개 옵션</div>
                        <div className="text-xs text-gray-500">재고: {totalStock}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {product.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <ComingSoonToggle productId={product.id} initialValue={product.is_coming_soon ?? false} />
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/products/${product.id}`} className="text-sm font-medium hover:underline">
                          수정
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
