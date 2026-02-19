'use client'

import { useState, type ReactNode } from 'react'
import type { ProductWithDetails } from '@/shared/types/database'

interface ProductDetailTabsProps {
  product: ProductWithDetails
  shippingPolicy?: string | null
}

/** "사이즈|총장|어깨\nS|67|44\n..." 형식을 파싱해 { headers, rows } 반환 */
function parseSizeChart(raw: string): { headers: string[]; rows: string[][] } | null {
  const lines = raw.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return null
  const headers = lines[0].split('|').map((s) => s.trim())
  const rows = lines.slice(1).map((line) => line.split('|').map((s) => s.trim()))
  if (headers.length < 2) return null
  return { headers, rows }
}

export function ProductDetailTabs({ product, shippingPolicy }: ProductDetailTabsProps) {
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

  const sizeChart = product.size_chart ? parseSizeChart(product.size_chart) : null
  const hasSizeInfo = sizeChart || product.size_material_care

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
        {hasSizeInfo ? (
          <div className="space-y-8">
            {/* 사이즈 차트 테이블 */}
            {sizeChart && (
              <div>
                <h4 className="text-sm font-semibold mb-3">사이즈 가이드</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-900">
                        {sizeChart.headers.map((h, i) => (
                          <th key={i} className="py-2.5 px-3 text-left font-semibold text-gray-800">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.rows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className={`py-2.5 px-3 ${j === 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
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
                  * 측정 방법에 따라 1~2cm 오차가 발생할 수 있습니다.
                </p>
              </div>
            )}

            {/* 소재 / 세탁 안내 텍스트 */}
            {product.size_material_care && (
              <div>
                <h4 className="text-sm font-semibold mb-3">소재 / 세탁 안내</h4>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                  {product.size_material_care}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">사이즈·소재·세탁 안내가 준비 중입니다.</p>
        )}
      </Accordion>

      {/* Section 3: 배송 / 교환 / 반품 */}
      <Accordion
        id="policy"
        title="배송 / 교환 / 반품 안내"
        isOpen={openSections.has('policy')}
        onToggle={toggle}
      >
        {shippingPolicy ? (
          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
            {shippingPolicy}
          </pre>
        ) : (
          <p className="text-sm text-gray-400">배송·교환·반품 안내가 준비 중입니다.</p>
        )}
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
