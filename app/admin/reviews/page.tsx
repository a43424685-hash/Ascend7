import { createAdminClient } from '@/shared/lib/supabase/admin'
import { ReviewManager } from '@/widgets/admin/review-manager'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const supabase = createAdminClient()

  const [{ data: items }, { data: products }] = await Promise.all([
    supabase
      .from('reviews')
      .select(`
        id, user_id, rating, title, content, is_active, created_at,
        admin_author_name, image_urls,
        author:profiles!user_id(display_name),
        product:products(name, slug)
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('id, name')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ])

  const allItems = items || []
  const activeCount = allItems.filter((r: any) => r.is_active).length
  const avgRating = allItems.length > 0
    ? (allItems.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / allItems.length).toFixed(1)
    : '-'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">리뷰 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          전체 {allItems.length}건 · 공개 {activeCount}건 · 평균 별점 {avgRating}
        </p>
      </div>

      <ReviewManager items={allItems as any} products={products || []} />
    </div>
  )
}
