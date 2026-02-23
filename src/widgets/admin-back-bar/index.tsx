'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/client'

export function AdminBackBar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (data?.role === 'admin') setIsAdmin(true)
    })
  }, [])

  // 어드민 페이지이거나 어드민이 아니면 표시 안 함
  if (pathname.startsWith('/admin')) return null
  if (!isAdmin) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-black text-white flex items-center justify-between px-4 h-9 shadow-md">
      <Link
        href="/admin"
        className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="tracking-wider font-medium">어드민으로 돌아가기</span>
      </Link>
      <span className="text-[10px] text-gray-600 tracking-widest uppercase select-none">Admin Mode</span>
    </div>
  )
}
