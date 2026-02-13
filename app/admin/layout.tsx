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
              <Link href="/admin" className="text-sm font-bold tracking-[0.15em]">
                ASCEND7 <span className="text-gray-400 font-normal">ADMIN</span>
              </Link>
              <nav className="hidden sm:flex items-center gap-6">
                <Link
                  href="/admin"
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  대시보드
                </Link>
                <Link
                  href="/admin/products"
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  상품
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  주문
                </Link>
                <Link
                  href="/admin/banners"
                  className="text-xs tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  배너
                </Link>
              </nav>
            </div>
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              스토어 보기 →
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-2 flex gap-4">
        <Link href="/admin" className="text-xs font-medium text-gray-600">대시보드</Link>
        <Link href="/admin/products" className="text-xs font-medium text-gray-600">상품</Link>
        <Link href="/admin/orders" className="text-xs font-medium text-gray-600">주문</Link>
        <Link href="/admin/banners" className="text-xs font-medium text-gray-600">배너</Link>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">{children}</main>
    </div>
  )
}
