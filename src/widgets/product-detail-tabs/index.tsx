'use client'

import { useState, type ReactNode } from 'react'
import type { ProductWithDetails } from '@/shared/types/database'
import { parseSizeChartJSON, QUALITY_OPTIONS } from '@/widgets/admin/size-chart-editor'
import { CARE_OPTIONS, CareIconSvg } from '@/widgets/admin/material-care-editor'

interface ProductDetailTabsProps {
  product: ProductWithDetails
  shippingPolicy?: string | null
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

  const sizeChart = parseSizeChartJSON(product.size_chart)
  const activeQualities = sizeChart
    ? Object.entries(sizeChart.qualities || {}).filter(([, v]) => v)
    : []
  const hasSizeSection =
    sizeChart ||
    product.size_material_care ||
    product.material ||
    (product.care_instructions && product.care_instructions.length > 0)

  return (
    <div className="border-t border-gray-200">
      {/* Section 1: 상품 상세 */}
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
        {hasSizeSection ? (
          <div className="space-y-8">
            {/* 사이즈 차트 테이블 */}
            {sizeChart && sizeChart.sizes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">사이즈 가이드</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-900">
                        <th className="py-2.5 px-3 text-center font-semibold text-gray-800">
                          사이즈
                        </th>
                        {sizeChart.columns.map((col) => (
                          <th
                            key={col}
                            className="py-2.5 px-3 text-center font-semibold text-gray-800"
                          >
                            {col}
                            <span className="block text-xs font-normal text-gray-400">(cm)</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.sizes.map((size, i) => (
                        <tr
                          key={size}
                          className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                        >
                          <td className="py-2.5 px-3 text-center font-semibold text-gray-900">
                            {size}
                          </td>
                          {sizeChart.columns.map((col) => (
                            <td
                              key={col}
                              className="py-2.5 px-3 text-center text-gray-600"
                            >
                              {sizeChart.data[size]?.[col] || '—'}
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

            {/* 원단 특성 */}
            {activeQualities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-4">원단 특성</h4>
                <div className="space-y-3">
                  {activeQualities.map(([metric, selected]) => {
                    const options = QUALITY_OPTIONS[metric] ?? []
                    return (
                      <div key={metric} className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 w-14 shrink-0">{metric}</span>
                        <div className="flex gap-1 flex-1">
                          {options.map((opt) => (
                            <div
                              key={opt}
                              className={`flex-1 text-center py-1 text-xs border rounded ${
                                opt === selected
                                  ? 'bg-gray-900 text-white border-gray-900 font-medium'
                                  : 'text-gray-300 border-gray-100'
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 소재 구성 (신규 structured) */}
            {product.material && (
              <div>
                <h4 className="text-sm font-semibold mb-2">소재 구성</h4>
                <p className="text-sm text-gray-600">{product.material}</p>
              </div>
            )}

            {/* 세탁 안내 아이콘 (신규 structured) */}
            {product.care_instructions && product.care_instructions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">세탁 안내</h4>
                <div className="flex flex-wrap gap-3">
                  {product.care_instructions.map((careId) => {
                    const opt = CARE_OPTIONS.find((o) => o.id === careId)
                    if (!opt) return null
                    return (
                      <div key={careId} className="flex flex-col items-center gap-1 w-14">
                        <CareIconSvg id={careId} className="w-8 h-8 text-gray-700" />
                        <span className="text-[10px] text-gray-500 text-center leading-tight break-keep">
                          {opt.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 레거시 소재 / 세탁 안내 텍스트 (기존 데이터 호환) */}
            {!product.material && !product.care_instructions && product.size_material_care && (
              <div>
                <h4 className="text-sm font-semibold mb-3">소재 / 세탁 안내</h4>
                {product.size_material_care.startsWith('<') ? (
                  <div
                    className="prose prose-sm max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-ul:list-none prose-ul:pl-0 prose-li:pl-0 prose-li:before:hidden"
                    dangerouslySetInnerHTML={{ __html: product.size_material_care }}
                  />
                ) : (
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                    {product.size_material_care}
                  </pre>
                )}
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
          shippingPolicy.startsWith('<') ? (
            <div
              className="prose prose-sm max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-ul:list-none prose-ul:pl-0 prose-li:pl-0 prose-li:before:hidden"
              dangerouslySetInnerHTML={{ __html: shippingPolicy }}
            />
          ) : (
            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
              {shippingPolicy}
            </pre>
          )
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
