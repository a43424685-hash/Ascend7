import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'
import { QnaWriteForm } from './qna-write-form'

export const dynamic = 'force-dynamic'

export default async function QnaWritePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/community/qna/write')
  }

  // 활성 상품 목록 (상품 선택용)
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-10 py-10">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 tracking-wider mb-2">
            <Link href="/community/qna" className="hover:text-black transition-colors">Q&A</Link>
            <span>›</span>
            <span>문의 작성</span>
          </div>
          <h1 className="text-xl font-black tracking-tight">문의 작성</h1>
        </div>
      </div>

      {/* 폼 */}
      <div className="container mx-auto px-6 lg:px-10 py-12 pb-24">
        <div className="max-w-2xl">
          <QnaWriteForm products={products || []} />
        </div>
      </div>
    </div>
  )
}
