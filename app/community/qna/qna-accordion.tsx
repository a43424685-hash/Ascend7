'use client'

import { useState } from 'react'
import type { QnaItem } from '@/entities/qna/api/get-qna'

interface QnaAccordionProps {
  items: QnaItem[]
  currentUserId: string | null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function QnaAccordion({ items, currentUserId }: QnaAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (items.length === 0) return null

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => {
        const isAnswered = !!item.answer
        const isMyPost = currentUserId === item.user_id
        const isExpanded = expandedId === item.id
        const authorName = item.author?.display_name || '회원'
        const canSeeContent = isMyPost || !item.is_secret

        return (
          <div key={item.id}>
            {/* 헤더 (항상 표시) */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="w-full text-left py-4 px-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* 비밀글 아이콘 */}
                <div className="w-5 shrink-0 flex justify-center">
                  {item.is_secret && (
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  )}
                </div>

                {/* 제목 영역 */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-medium text-gray-800 truncate">{item.title}</p>
                    {item.product && (
                      <span className="text-[10px] text-gray-400 shrink-0">[{item.product.name}]</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                    <span>{item.is_secret && !isMyPost ? '비밀글' : authorName}</span>
                    <span>·</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>

                {/* 답변 상태 + 화살표 */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] px-2 py-0.5 font-medium tracking-wider ${
                    isAnswered ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isAnswered ? '답변완료' : '미답변'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* 펼쳐진 내용 */}
            {isExpanded && (
              <div className="px-4 pb-5 bg-gray-50/40">
                <div className="ml-8 space-y-4">
                  {/* 문의 내용 */}
                  {canSeeContent ? (
                    <div className="pt-3">
                      <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mb-2">문의 내용</p>
                      <div className="bg-white border border-gray-100 p-4 rounded">
                        <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3">
                      <div className="bg-white border border-gray-100 p-4 rounded flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span className="text-[12px]">비밀글입니다. 작성자와 관리자만 확인할 수 있습니다.</span>
                      </div>
                    </div>
                  )}

                  {/* 답변 */}
                  {isAnswered && canSeeContent && (
                    <div className="border-l-2 border-black/10 pl-4">
                      <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mb-2">
                        ASCEND7 답변
                        {item.answered_at && (
                          <span className="ml-2 font-normal normal-case">{formatDate(item.answered_at)}</span>
                        )}
                      </p>
                      <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
