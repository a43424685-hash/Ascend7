import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-black text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link href="/admin" prefetch={false} className="text-sm font-bold tracking-[0.15em]">
                ASCEND7 <span className="text-gray-400 font-normal">ADMIN</span>
              </Link>
              <nav className="hidden sm:flex items-center gap-6">
                <Link
                  href="/admin"
                  prefetch={false}
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  대시보드
                </Link>
                <Link
                  href="/admin/products"
                  prefetch={false}
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  상품
                </Link>
                <Link
                  href="/admin/orders"
                  prefetch={false}
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  주문
                </Link>
                <Link
                  href="/admin/reviews"
                  prefetch={false}
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  리뷰
                </Link>
                <Link
                  href="/admin/lookbook"
                  prefetch={false}
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  룩북
                </Link>
                <Link
                  href="/admin/qna"
                  prefetch={false}
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  Q&A
                </Link>
                <Link
                  href="/admin/events"
                  prefetch={false}
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  이벤트
                </Link>
                <Link
                  href="/admin/shipping"
                  prefetch={false}
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  배송
                </Link>
              </nav>
            </div>
            <Link
              href="/"
              prefetch={false}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              스토어 보기 →
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-2 flex gap-3 overflow-x-auto">
        <Link href="/admin" prefetch={false} className="text-xs font-medium text-gray-600 shrink-0">대시보드</Link>
        <Link href="/admin/products" prefetch={false} className="text-xs font-medium text-gray-600 shrink-0">상품</Link>
        <Link href="/admin/orders" prefetch={false} className="text-xs font-medium text-gray-600 shrink-0">주문</Link>
        <Link href="/admin/reviews" prefetch={false} className="text-xs font-medium text-gray-600 shrink-0">리뷰</Link>
        <Link href="/admin/lookbook" prefetch={false} className="text-xs font-medium text-gray-600 shrink-0">룩북</Link>
        <Link href="/admin/qna" prefetch={false} className="text-xs font-medium text-gray-600 shrink-0">Q&A</Link>
        <Link href="/admin/events" prefetch={false} className="text-xs font-medium text-gray-600 shrink-0">이벤트</Link>
        <Link href="/admin/shipping" prefetch={false} className="text-xs font-medium text-gray-600 shrink-0">배송</Link>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">{children}</main>
    </div>
  )
}
