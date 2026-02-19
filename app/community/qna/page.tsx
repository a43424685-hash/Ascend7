import Link from 'next/link'
import { createClient } from '@/shared/lib/supabase/server'
import { getQnaList } from '@/entities/qna/api/get-qna'
import { QnaAccordion } from './qna-accordion'

export const dynamic = 'force-dynamic'

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
        {/* 컬럼 헤더 */}
        {qnaList.length > 0 && (
          <div className="flex items-center px-4 py-3 text-[10px] tracking-[0.15em] text-gray-300 uppercase border-b border-gray-100 gap-3">
            <span className="w-5" />
            <span className="flex-1">제목</span>
            <span>답변</span>
            <span className="w-4" />
          </div>
        )}

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
          <QnaAccordion items={qnaList} currentUserId={user?.id ?? null} />
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
