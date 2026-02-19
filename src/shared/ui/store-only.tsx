'use client'

import { usePathname } from 'next/navigation'

/**
 * 스토어 페이지에서만 children을 렌더링하는 래퍼.
 * /admin/* 경로에서는 렌더링하지 않음.
 * usePathname()은 클라이언트 전용이므로 루트 레이아웃을 dynamic으로 만들지 않음.
 */
export function StoreOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
  return <>{children}</>
}
