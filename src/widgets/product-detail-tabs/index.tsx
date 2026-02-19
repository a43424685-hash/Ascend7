'use client'

import { useState, type ReactNode } from 'react'
import type { ProductWithDetails } from '@/shared/types/database'


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
        {product.size_material_care ? (
          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
            {product.size_material_care}
          </pre>
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
