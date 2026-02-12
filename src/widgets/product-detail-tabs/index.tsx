'use client'

import { useState, type ReactNode } from 'react'
import type { ProductWithDetails } from '@/shared/types/database'

/* 사이즈 가이드 상수 - 추후 수정 가능 */
const SIZE_GUIDE = {
  headers: ['사이즈', '총장(cm)', '어깨(cm)', '가슴(cm)', '소매(cm)'],
  rows: [
    ['S', '67', '44', '104', '62'],
    ['M', '69', '46', '108', '63'],
    ['L', '71', '48', '112', '64'],
    ['XL', '73', '50', '116', '65'],
  ],
}

const CARE_INSTRUCTIONS = [
  '찬물 또는 미지근한 물에서 단독 세탁',
  '표백제 사용 금지',
  '낮은 온도에서 건조',
  '다림질 시 중간 온도',
]

interface ProductDetailTabsProps {
  product: ProductWithDetails
}

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['description'])
  )

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="border-t border-gray-200">
      {/* Section 1: 상품 설명 */}
      <Accordion
        id="description"
        title="상품 상세"
        isOpen={openSections.has('description')}
        onToggle={toggle}
      >
        {product.detail_content ? (
          <div
            className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-none"
            dangerouslySetInnerHTML={{ __html: product.detail_content }}
          />
        ) : product.description ? (
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        ) : (
          <p className="text-gray-400 text-sm">상세 정보가 준비 중입니다.</p>
        )}
      </Accordion>

      {/* Section 2: 사이즈 / 소재 / 세탁 */}
      <Accordion
        id="info"
        title="사이즈 / 소재 / 세탁 안내"
        isOpen={openSections.has('info')}
        onToggle={toggle}
      >
        <div className="space-y-8">
          {/* Size Guide */}
          <div>
            <h4 className="text-sm font-semibold mb-3">사이즈 가이드</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    {SIZE_GUIDE.headers.map((h) => (
                      <th
                        key={h}
                        className="py-2.5 px-3 text-left font-semibold text-gray-800"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE.rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`py-2.5 px-3 ${
                            j === 0 ? 'font-semibold' : 'text-gray-600'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * 측정 방법에 따라 1~3cm 오차가 발생할 수 있습니다.
            </p>
          </div>

          {/* Material */}
          <div>
            <h4 className="text-sm font-semibold mb-2">소재</h4>
            <p className="text-sm text-gray-600">
              상세 소재 정보는 상품 상세를 참고해주세요.
            </p>
          </div>

          {/* Care Instructions */}
          <div>
            <h4 className="text-sm font-semibold mb-2">세탁 안내</h4>
            <ul className="space-y-1.5">
              {CARE_INSTRUCTIONS.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-600 flex items-start gap-2"
                >
                  <span className="text-gray-400 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Accordion>

      {/* Section 3: 배송 / 교환 / 반품 */}
      <Accordion
        id="policy"
        title="배송 / 교환 / 반품 안내"
        isOpen={openSections.has('policy')}
        onToggle={toggle}
      >
        <div className="space-y-6 text-sm">
          {/* Shipping */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">배송 안내</h4>
            <div className="space-y-1.5 text-gray-600">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-700">배송 방법</span>
                <span>택배 배송</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-700">배송비</span>
                <span>3,000원 (50,000원 이상 무료배송)</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-700">배송 기간</span>
                <span>결제 완료 후 1~3 영업일 이내 출고</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Exchange */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">교환 안내</h4>
            <p className="text-gray-600 mb-2">
              상품 수령 후 7일 이내 교환 가능
            </p>
            <p className="font-medium text-gray-700 mb-1">
              교환 불가 사유:
            </p>
            <ul className="text-gray-500 space-y-1 ml-4 list-disc">
              <li>착용 흔적이 있는 경우</li>
              <li>택(Tag)이 제거된 경우</li>
              <li>세탁 또는 수선한 경우</li>
              <li>고객 부주의로 상품이 훼손된 경우</li>
            </ul>
          </div>

          <div className="border-t border-gray-100" />

          {/* Refund */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              반품 / 환불 안내
            </h4>
            <div className="space-y-1.5 text-gray-600">
              <p>상품 수령 후 7일 이내 반품 가능</p>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-700">반품 배송비</span>
                <span>고객 변심: 왕복 6,000원 / 불량: 무료</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-700">환불 소요</span>
                <span>반품 수령 후 3~5 영업일</span>
              </div>
            </div>
          </div>
        </div>
      </Accordion>
    </div>
  )
}

function Accordion({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id: string
  title: string
  isOpen: boolean
  onToggle: (id: string) => void
  children: ReactNode
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-base font-semibold tracking-tight">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <div className="pb-6">{children}</div>}
    </div>
  )
}
