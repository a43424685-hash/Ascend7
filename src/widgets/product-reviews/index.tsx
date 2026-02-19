import Link from 'next/link'
import { getReviewsByProduct, getReviewStatsByProduct } from '@/entities/review/api/get-reviews'

interface ProductReviewsProps {
  productId: string
  productSlug: string
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? 'text-black' : 'text-gray-200'} shrink-0`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-400 w-6 text-right shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-black rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-300 w-4 shrink-0">{count}</span>
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export async function ProductReviews({ productId, productSlug }: ProductReviewsProps) {
  const [reviews, stats] = await Promise.all([
    getReviewsByProduct(productId, 4),
    getReviewStatsByProduct(productId),
  ])

  // 별점별 분포 계산
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.length > 0
      ? reviews.filter((r) => r.rating === star).length
      : 0,
  }))

  return (
    <section className="mt-16 lg:mt-24">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold tracking-tight uppercase">Review</h2>
          {stats.count > 0 && (
            <span className="text-[11px] text-gray-400">({stats.count})</span>
          )}
        </div>
        <Link
          href="/community/review"
          className="text-[11px] text-gray-400 hover:text-black transition-colors tracking-wider"
        >
          전체 리뷰 보기 →
        </Link>
      </div>

      {stats.count === 0 ? (
        /* 리뷰 없음 */
        <div className="border-t border-b border-gray-100 py-12 text-center">
          <p className="text-sm text-gray-400 mb-1">아직 작성된 리뷰가 없습니다</p>
          <p className="text-[11px] text-gray-300">구매 후 첫 번째 리뷰를 남겨보세요</p>
        </div>
      ) : (
        <div className="border-t border-gray-100">
          {/* 별점 요약 */}
          <div className="py-8 flex flex-col sm:flex-row gap-8 border-b border-gray-100">
            {/* 평균 별점 */}
            <div className="flex flex-col items-center justify-center sm:w-40 shrink-0">
              <p className="text-5xl font-bold tracking-tight mb-2">{stats.average}</p>
              <StarRating rating={stats.average} size="md" />
              <p className="text-[11px] text-gray-400 mt-1.5">{stats.count}개 리뷰</p>
            </div>

            {/* 별점 분포 바 */}
            <div className="flex-1 flex flex-col justify-center gap-2 max-w-xs">
              {distribution.map(({ star, count }) => (
                <RatingBar
                  key={star}
                  label={String(star)}
                  count={count}
                  total={stats.count}
                />
              ))}
            </div>
          </div>

          {/* 리뷰 카드 목록 */}
          <div className="divide-y divide-gray-50">
            {reviews.map((review) => {
              const authorName = review.admin_author_name || review.reviewer?.display_name || '회원'
              const bodyInfo = [
                review.height ? `${review.height}cm` : null,
                review.weight ? `${review.weight}kg` : null,
                review.body_type || null,
              ].filter(Boolean).join(' · ')

              return (
                <div key={review.id} className="py-5">
                  {/* 별점 + 작성자 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-[11px] font-semibold text-gray-700">{review.rating}.0</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-gray-500">{authorName}</span>
                      <span className="text-[10px] text-gray-300 ml-2">{formatDate(review.created_at)}</span>
                    </div>
                  </div>

                  {/* 체형 정보 */}
                  {bodyInfo && (
                    <p className="text-[10px] text-gray-400 mb-2">{bodyInfo}</p>
                  )}

                  {/* 제목 */}
                  {review.title && (
                    <p className="text-[13px] font-semibold text-gray-800 mb-1">{review.title}</p>
                  )}

                  {/* 내용 */}
                  <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-3">
                    {review.content}
                  </p>
                </div>
              )
            })}
          </div>

          {/* 전체 보기 버튼 */}
          {stats.count > 4 && (
            <div className="pt-4 pb-2">
              <Link
                href="/community/review"
                className="block w-full py-3 border border-gray-200 text-center text-[11px] font-semibold tracking-[0.12em] text-gray-600 hover:border-black hover:text-black transition-colors"
              >
                리뷰 {stats.count}개 전체 보기
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
