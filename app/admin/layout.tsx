import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-xl font-bold">
                ASCEND7 Admin
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/admin/products"
                  className="text-sm font-medium hover:underline"
                >
                  Products
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium hover:underline"
                >
                  Orders
                </Link>
              </nav>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:underline"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

