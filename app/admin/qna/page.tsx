import { createAdminClient } from '@/shared/lib/supabase/admin'
import { QnaManager } from '@/widgets/admin/qna-manager'

export const dynamic = 'force-dynamic'

export default async function AdminQnaPage() {
  const supabase = createAdminClient()

  const { data: items } = await supabase
    .from('qna')
    .select(`
      id, title, content, is_secret, is_active, answer, answered_at, created_at,
      author:profiles!user_id(display_name),
      product:products(name)
    `)
    .order('created_at', { ascending: false })

  const allItems = items || []
  const unanswered = allItems.filter((q: any) => !q.answer).length
  const answered = allItems.filter((q: any) => q.answer).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Q&A 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          전체 {allItems.length}건 · 미답변 <span className="text-amber-600 font-medium">{unanswered}건</span> · 답변완료 {answered}건
        </p>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-1 text-xs">
        <span className="px-3 py-1.5 bg-black text-white rounded-full font-medium">전체 ({allItems.length})</span>
        <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full font-medium">미답변 ({unanswered})</span>
      </div>

      <QnaManager items={allItems as any} />
    </div>
  )
}
