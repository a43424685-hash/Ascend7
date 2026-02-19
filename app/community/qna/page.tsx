import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'
import { getQnaList } from '@/entities/qna/api/get-qna'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function QnaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const qnaList = await getQnaList()

  return (
    <div className="min-h-screen">
      {/* 페이지 헤더 */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-10 py-10">
          <p className="text-[9px] tracking-[0.4em] text-gray-400 uppercase mb-1">Community</p>
          <div className="flex items-end justify-between">
            <h1 className="text-xl font-black tracking-tight">Q&A</h1>
            {user ? (
              <Link
                href="/community/qna/write"
                className="px-5 py-2 bg-black text-white text-[11px] font-semibold tracking-[0.12em] hover:bg-gray-800 transition-colors"
              >
                문의 작성
              </Link>
            ) : (
              <Link
                href="/auth/login?redirect=/community/qna/write"
                className="px-5 py-2 border border-gray-200 text-[11px] font-semibold tracking-[0.12em] text-gray-500 hover:border-black hover:text-black transition-colors"
              >
                로그인 후 작성
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Q&A 목록 */}
      <div className="container mx-auto px-6 lg:px-10 py-8 pb-24">
        {/* 헤더 행 */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 text-[10px] tracking-[0.15em] text-gray-300 uppercase border-b border-gray-100">
          <span className="w-6" />
          <span>제목</span>
          <span className="w-28">작성자</span>
          <span className="w-24">날짜</span>
          <span className="w-16 text-right">답변</span>
        </div>

        {qnaList.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-12 h-12 mx-auto mb-5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium tracking-wide">아직 작성된 문의가 없습니다</p>
            {user && (
              <Link
                href="/community/qna/write"
                className="inline-block mt-6 px-6 py-2.5 border border-gray-200 text-[11px] tracking-[0.15em] font-medium text-gray-500 hover:text-black hover:border-black transition-colors"
              >
                첫 번째 문의 작성하기
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {qnaList.map((item) => {
              const isAnswered = !!item.answer
              const isMyPost = user?.id === item.user_id
              const authorName = item.author?.display_name || '회원'

              return (
                <div key={item.id} className="py-4 px-4 hover:bg-gray-50/50 transition-colors">
                  {/* 모바일 레이아웃 */}
                  <div className="sm:hidden">
                    <div className="flex items-start gap-2 mb-1">
                      {item.is_secret && (
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      )}
                      <p className="text-[13px] font-medium text-gray-800 line-clamp-1 flex-1">{item.title}</p>
                      <span className={`shrink-0 text-[9px] px-2 py-0.5 font-medium tracking-wider ${
                        isAnswered ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isAnswered ? '답변완료' : '미답변'}
                      </span>
                    </div>
                    {item.product && (
                      <p className="text-[10px] text-gray-400 mb-1">[{item.product.name}]</p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{isMyPost ? authorName : item.is_secret ? '비밀글' : authorName}</span>
                      <span>·</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    {/* 답변 (있을 때) */}
                    {isAnswered && (isMyPost || !item.is_secret) && (
                      <div className="mt-3 ml-3 pl-3 border-l-2 border-gray-100">
                        <p className="text-[10px] text-gray-400 font-medium mb-1 tracking-wider">ASCEND7 답변</p>
                        <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                      </div>
                    )}
                  </div>

                  {/* 데스크탑 레이아웃 */}
                  <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center">
                    {/* 비밀글 아이콘 */}
                    <div className="w-6 flex justify-center">
                      {item.is_secret && (
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      )}
                    </div>

                    {/* 제목 + 상품명 */}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-gray-800 line-clamp-1">{item.title}</p>
                      {item.product && (
                        <p className="text-[10px] text-gray-400 mt-0.5">[{item.product.name}]</p>
                      )}
                      {/* 답변 (인라인) */}
                      {isAnswered && (isMyPost || !item.is_secret) && (
                        <div className="mt-2 pl-3 border-l-2 border-gray-100">
                          <p className="text-[10px] text-gray-400 font-medium mb-0.5 tracking-wider">ASCEND7</p>
                          <p className="text-[11px] text-gray-500 line-clamp-2">{item.answer}</p>
                        </div>
                      )}
                    </div>

                    {/* 작성자 */}
                    <span className="w-28 text-[11px] text-gray-400 truncate">
                      {isMyPost ? authorName : item.is_secret ? '비밀글' : authorName}
                    </span>

                    {/* 날짜 */}
                    <span className="w-24 text-[11px] text-gray-300">{formatDate(item.created_at)}</span>

                    {/* 답변 상태 */}
                    <span className={`w-16 text-right text-[9px] font-medium tracking-wider ${
                      isAnswered ? 'text-black' : 'text-gray-300'
                    }`}>
                      {isAnswered ? '답변완료' : '미답변'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 하단 글쓰기 버튼 */}
        {qnaList.length > 0 && (
          <div className="mt-8 text-right">
            {user ? (
              <Link
                href="/community/qna/write"
                className="inline-block px-6 py-2.5 bg-black text-white text-[11px] font-semibold tracking-[0.12em] hover:bg-gray-800 transition-colors"
              >
                문의 작성
              </Link>
            ) : (
              <Link
                href="/auth/login?redirect=/community/qna/write"
                className="inline-block px-6 py-2.5 border border-gray-200 text-[11px] font-semibold text-gray-500 hover:text-black hover:border-black transition-colors tracking-[0.12em]"
              >
                로그인 후 작성
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
