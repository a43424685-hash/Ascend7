import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4">
        {/* 메인 푸터 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12 lg:py-16">
          {/* 브랜드 */}
          <div>
            <p className="text-sm font-bold tracking-[0.2em] mb-3">ASCEND7</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              고성능 트레이닝을 위한<br />
              프리미엄 짐웨어 브랜드
            </p>
          </div>

          {/* 쇼핑 */}
          <div>
            <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-3">Shop</p>
            <div className="space-y-2">
              <Link href="/shop" className="block text-xs text-gray-400 hover:text-white transition-colors">전체 상품</Link>
              <Link href="/shop?category=top" className="block text-xs text-gray-400 hover:text-white transition-colors">상의</Link>
              <Link href="/shop?category=bottom" className="block text-xs text-gray-400 hover:text-white transition-colors">하의</Link>
              <Link href="/shop?category=accessories" className="block text-xs text-gray-400 hover:text-white transition-colors">악세서리</Link>
            </div>
          </div>

          {/* 고객 */}
          <div>
            <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-3">Support</p>
            <div className="space-y-2">
              <Link href="/account" className="block text-xs text-gray-400 hover:text-white transition-colors">마이페이지</Link>
              <Link href="/account/orders" className="block text-xs text-gray-400 hover:text-white transition-colors">주문조회</Link>
            </div>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-gray-600">
            © {new Date().getFullYear()} ASCEND7. All rights reserved.
          </p>
          <p className="text-[10px] text-gray-700">
            사업자등록번호 000-00-00000
          </p>
        </div>
      </div>
    </footer>
  )
}
