'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { createQnaAction } from './actions'

interface Product {
  id: string
  name: string
  slug: string
}

interface QnaWriteFormProps {
  products: Product[]
}

export function QnaWriteForm({ products }: QnaWriteFormProps) {
  const [state, formAction] = useFormState(createQnaAction, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {/* 에러 */}
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {/* 상품 선택 (선택사항) */}
      <div>
        <label className="block text-[11px] font-semibold tracking-[0.12em] text-gray-500 uppercase mb-2">
          관련 상품 <span className="text-gray-300 font-normal">(선택)</span>
        </label>
        <select
          name="product_id"
          className="w-full px-4 py-3 border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:border-black transition-colors"
        >
          <option value="">상품을 선택하세요</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-[11px] font-semibold tracking-[0.12em] text-gray-500 uppercase mb-2">
          제목 <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          placeholder="제목을 입력하세요"
          className="w-full px-4 py-3 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* 내용 */}
      <div>
        <label htmlFor="content" className="block text-[11px] font-semibold tracking-[0.12em] text-gray-500 uppercase mb-2">
          내용 <span className="text-red-400">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={8}
          placeholder="문의 내용을 입력하세요"
          className="w-full px-4 py-3 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors resize-none leading-relaxed"
        />
      </div>

      {/* 비밀글 */}
      <div className="flex items-center gap-3">
        <input
          id="is_secret"
          name="is_secret"
          type="checkbox"
          className="w-4 h-4 border border-gray-300 accent-black"
        />
        <label htmlFor="is_secret" className="text-[12px] text-gray-500 cursor-pointer">
          비밀글로 작성 (나와 관리자만 볼 수 있습니다)
        </label>
      </div>

      {/* 버튼 */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-8 py-3 bg-black text-white text-[11px] font-bold tracking-[0.15em] hover:bg-gray-800 transition-colors"
        >
          문의 등록
        </button>
        <Link
          href="/community/qna"
          className="px-8 py-3 border border-gray-200 text-[11px] font-medium tracking-[0.15em] text-gray-500 hover:text-black hover:border-black transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
