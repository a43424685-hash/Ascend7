import Image from 'next/image'
import Link from 'next/link'
import { getReviews, getReviewStats } from '@/entities/review/api/get-reviews'

export const dynamic = 'force-dynamic'

type SortBy = 'newest' | 'best'

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-4 h-4' : 'w-3 h-3'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${cls} ${s <= rating ? 'text-black' : 'text-gray-200'} shrink-0`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: { sort?: string }
}) {
  const sortBy: SortBy = searchParams.sort === 'best' ? 'best' : 'newest'
  const [reviews, stats] = await Promise.all([getReviews(sortBy), getReviewStats()])

  return (
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-10 py-10">
          <p className="text-[9px] tracking-[0.4em] text-gray-400 uppercase mb-1">Community</p>
          <div className="flex items-end justify-between">
            <h1 className="text-xl font-black tracking-tight">REVIEW</h1>
            {stats.count > 0 && (
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <StarRating rating={Math.round(stats.average)} size="sm" />
                <span className="font-medium text-gray-600">{stats.average}</span>
                <span>({stats.count}개)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 정렬 필터 */}
      <div className="sticky top-16 z-[100] bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-center h-12 gap-0">
            {([
              { label: '최신순', value: 'newest' },
              { label: '별점순', value: 'best' },
            ] as const).map((opt) => {
              const isActive = sortBy === opt.value
              return (
                <Link
                  key={opt.value}
                  href={`/community/review?sort=${opt.value}`}
                  className={`relative px-4 h-12 flex items-center text-[11px] font-semibold tracking-[0.15em] transition-colors ${
                    isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />}
                </Link>
              )
            })}
            <span className="ml-auto text-[10px] text-gray-300 tabular-nums">{stats.count}개</span>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="container mx-auto px-6 lg:px-10 py-12 pb-24">
        {reviews.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium tracking-wide">아직 작성된 리뷰가 없습니다</p>
            <p className="text-xs text-gray-300 mt-1.5">상품 구매 후 첫 번째 리뷰를 남겨보세요</p>
            <Link
              href="/shop"
              className="inline-block mt-6 px-6 py-2.5 border border-gray-200 text-[11px] tracking-[0.15em] font-medium text-gray-500 hover:text-black hover:border-black transition-colors"
            >
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {reviews.map((review) => {
              const mainImage = review.product?.images
                ?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url
              const authorName = review.admin_author_name || review.reviewer?.display_name || '회원'
              const bodyInfo = [
                review.height ? `${review.height}cm` : null,
                review.weight ? `${review.weight}kg` : null,
                review.body_type || null,
              ].filter(Boolean).join(' / ')

              return (
                <div key={review.id} className="border border-gray-100 p-5 hover:border-gray-300 transition-colors">
                  {/* 상품 정보 */}
                  {review.product && (
                    <Link
                      href={`/product/${review.product.slug}`}
                      className="flex items-center gap-3 mb-4 group"
                    >
                      <div className="w-12 h-12 bg-gray-50 shrink-0 overflow-hidden">
                        {mainImage ? (
                          <Image
                            src={mainImage}
                            alt={review.product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[8px] text-gray-300">No img</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 group-hover:text-black transition-colors line-clamp-1 tracking-wide">
                        {review.product.name}
                      </p>
                    </Link>
                  )}

                  {/* 별점 */}
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={review.rating} />
                    <span className="text-[11px] font-semibold text-gray-700">{review.rating}.0</span>
                  </div>

                  {/* 제목 */}
                  {review.title && (
                    <p className="text-[13px] font-semibold text-gray-800 mb-2 line-clamp-1">
                      {review.title}
                    </p>
                  )}

                  {/* 내용 */}
                  <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-3">
                    {review.content}
                  </p>

                  {/* 체형 정보 */}
                  {bodyInfo && (
                    <p className="text-[10px] text-gray-400 mt-2">{bodyInfo}</p>
                  )}

                  {/* 작성자 + 날짜 */}
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{authorName}</span>
                    <span className="text-[10px] text-gray-300">{formatDate(review.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
