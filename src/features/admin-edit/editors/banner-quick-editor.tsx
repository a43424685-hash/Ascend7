'use client'

import Link from 'next/link'

export function BannerQuickEditor() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        히어로 배너는 전용 관리 페이지에서 수정합니다.<br />
        데스크탑/모바일 이미지, CTA 버튼, 노출 기간 등을 설정할 수 있습니다.
      </p>
      <Link
        href="/admin/banners"
        className="block w-full text-center px-4 py-3 bg-black text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors"
      >
        배너 관리 페이지로 이동
      </Link>
    </div>
  )
}
