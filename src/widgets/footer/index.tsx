import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white mt-auto">
      <div className="h-px bg-white/5" />

      <div className="container mx-auto px-6 lg:px-10">
        {/* 메인 푸터 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-14 lg:py-18">
          {/* 브랜드 */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-black tracking-[0.25em] mb-5 text-white">ASCEND7</p>
            <p className="text-[11px] text-gray-600 leading-relaxed mb-5">
              고성능 트레이닝을 위한<br />
              프리미엄 짐웨어 브랜드
            </p>
            <p className="text-[9px] text-gray-700 tracking-[0.2em] uppercase">
              Ascend Every Day. All Seven.
            </p>
          </div>

          {/* 카테고리 */}
          <div>
            <p className="text-[9px] tracking-[0.2em] text-gray-600 uppercase mb-4 font-medium">Shop</p>
            <div className="space-y-3">
              <Link href="/shop" className="block text-xs text-gray-600 hover:text-white transition-colors duration-200">전체 상품</Link>
              <Link href="/shop?category=top" className="block text-xs text-gray-600 hover:text-white transition-colors duration-200">상의</Link>
              <Link href="/shop?category=bottom" className="block text-xs text-gray-600 hover:text-white transition-colors duration-200">하의</Link>
              <Link href="/shop?category=accessories" className="block text-xs text-gray-600 hover:text-white transition-colors duration-200">악세서리</Link>
            </div>
          </div>

          {/* 고객 서비스 */}
          <div>
            <p className="text-[9px] tracking-[0.2em] text-gray-600 uppercase mb-4 font-medium">Support</p>
            <div className="space-y-3">
              <Link href="/account" className="block text-xs text-gray-600 hover:text-white transition-colors duration-200">마이페이지</Link>
              <Link href="/account/orders" className="block text-xs text-gray-600 hover:text-white transition-colors duration-200">주문조회</Link>
              <Link href="/cart" className="block text-xs text-gray-600 hover:text-white transition-colors duration-200">장바구니</Link>
            </div>
          </div>

          {/* 회사 정보 */}
          <div>
            <p className="text-[9px] tracking-[0.2em] text-gray-600 uppercase mb-4 font-medium">Info</p>
            <div className="space-y-3">
              <Link href="/terms" className="block text-xs text-gray-600 hover:text-white transition-colors duration-200">이용약관</Link>
              <Link href="/privacy" className="block text-xs text-gray-600 hover:text-white transition-colors duration-200">개인정보처리방침</Link>
            </div>
          </div>
        </div>

        {/* 사업자 정보 + 저작권 */}
        <div className="border-t border-white/5 py-7">
          <div className="text-[10px] text-gray-700 leading-relaxed space-y-0.5">
            <p>상호: 보틀천 | 대표: 이병천 | 사업자등록번호: 369-17-02526</p>
            <p>주소: 서울특별시 강북구 노해로34, 9층</p>
            <p>통신판매업신고: 제2026-서울강북-0119호 | 개인정보관리책임자: 이병천</p>
            <p>고객센터: 070-8098-7618 | help@ascend7.kr | 운영시간: 평일 10:00 - 18:00 (점심 12:00 - 13:00)</p>
            <p className="pt-3 text-gray-700">&copy; {new Date().getFullYear()} ASCEND7. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
