'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { answerQna, updateQnaAnswer, deleteQnaAnswer, toggleQnaActive, deleteQna } from '@/features/admin/actions/qna-management'

interface QnaItem {
  id: string
  title: string
  content: string
  is_secret: boolean
  is_active: boolean
  answer: string | null
  answered_at: string | null
  created_at: string
  author: { display_name: string | null } | null
  product: { name: string } | null
}

interface QnaManagerProps {
  items: QnaItem[]
}

function formatDate(str: string) {
  const d = new Date(str)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function QnaManager({ items }: QnaManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answeringId, setAnsweringId] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      if (!result.success) setError(result.error || '오류가 발생했습니다.')
      else router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartAnswer = (item: QnaItem) => {
    setAnsweringId(item.id)
    setAnswerText(item.answer || '')
    setExpandedId(item.id)
  }

  const handleSubmitAnswer = async (item: QnaItem) => {
    if (!answerText.trim()) return
    await run(() => item.answer
      ? updateQnaAnswer(item.id, answerText)
      : answerQna(item.id, answerText)
    )
    setAnsweringId(null)
    setAnswerText('')
  }

  const handleDeleteAnswer = async (id: string) => {
    if (!confirm('답변을 삭제하시겠습니까?')) return
    await run(() => deleteQnaAnswer(id))
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    await run(() => toggleQnaActive(id, !isActive))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return
    await run(() => deleteQna(id))
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">닫기</button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-400 text-sm">등록된 문의가 없습니다</p>
        </div>
      ) : (
        items.map((item) => {
          const isExpanded = expandedId === item.id
          const isAnswering = answeringId === item.id

          return (
            <div key={item.id} className={`bg-white border rounded-lg overflow-hidden ${!item.is_active ? 'opacity-60' : ''}`}>
              {/* 헤더 */}
              <div
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {item.is_secret && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">비밀글</span>
                    )}
                    {item.product && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{item.product.name}</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      item.answer ? 'bg-black text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.answer ? '답변완료' : '미답변'}
                    </span>
                    {!item.is_active && (
                      <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded">숨김</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {item.author?.display_name || '회원'} · {formatDate(item.created_at)}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* 펼쳐진 내용 */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                  {/* 문의 내용 */}
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wider">문의 내용</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                  </div>

                  {/* 기존 답변 */}
                  {item.answer && !isAnswering && (
                    <div className="bg-blue-50 rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">ASCEND7 답변</p>
                        <span className="text-[10px] text-gray-400">{item.answered_at ? formatDate(item.answered_at) : ''}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.answer}</p>
                    </div>
                  )}

                  {/* 답변 입력 폼 */}
                  {isAnswering ? (
                    <div className="space-y-2">
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        rows={5}
                        placeholder="답변을 입력하세요..."
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:border-black"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitAnswer(item)}
                          disabled={loading || !answerText.trim()}
                          className="px-4 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50"
                        >
                          {loading ? '저장 중...' : '답변 등록'}
                        </button>
                        <button
                          onClick={() => { setAnsweringId(null); setAnswerText('') }}
                          className="px-4 py-1.5 border border-gray-300 text-xs rounded hover:border-black"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                    {!isAnswering && (
                      <button
                        onClick={() => handleStartAnswer(item)}
                        disabled={loading}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {item.answer ? '답변 수정' : '답변 작성'}
                      </button>
                    )}
                    {item.answer && !isAnswering && (
                      <button
                        onClick={() => handleDeleteAnswer(item.id)}
                        disabled={loading}
                        className="text-xs text-orange-500 hover:underline"
                      >
                        답변 삭제
                      </button>
                    )}
                    <button
                      onClick={() => handleToggle(item.id, item.is_active)}
                      disabled={loading}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      {item.is_active ? '숨기기' : '공개'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loading}
                      className="text-xs text-red-500 hover:underline ml-auto"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
