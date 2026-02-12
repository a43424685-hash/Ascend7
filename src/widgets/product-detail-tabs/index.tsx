'use client'

import { useState } from 'react'
import type { ProductWithDetails } from '@/shared/types/database'

interface ProductDetailTabsProps {
  product: ProductWithDetails
}

const tabs = [
  { id: 'detail', label: '상품 상세' },
  { id: 'review', label: '리뷰' },
  { id: 'policy', label: '배송 / 교환 / 반품' },
] as const

type TabId = (typeof tabs)[number]['id']

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('detail')

  return (
    <div className="mt-20">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center text-sm font-semibold tracking-wide transition-colors relative ${
                activeTab === tab.id
                  ? 'text-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-12">
        {activeTab === 'detail' && <DetailContent product={product} />}
        {activeTab === 'review' && <ReviewContent />}
        {activeTab === 'policy' && <PolicyContent />}
      </div>
    </div>
  )
}

function DetailContent({ product }: { product: ProductWithDetails }) {
  if (product.detail_content) {
    return (
      <div className="max-w-3xl mx-auto">
        <div
          className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-none"
          dangerouslySetInnerHTML={{ __html: product.detail_content }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-16">
      {/* Placeholder detail content */}
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-light tracking-wide">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 leading-relaxed max-w-xl mx-auto">
            {product.description}
          </p>
        )}
      </div>

      {/* Product Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center space-y-3 p-6">
          <div className="w-12 h-12 mx-auto border border-gray-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="font-semibold text-sm tracking-wide">프리미엄 소재</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            엄선된 최고급 원단으로 제작되어 뛰어난 착용감을 제공합니다.
          </p>
        </div>
        <div className="text-center space-y-3 p-6">
          <div className="w-12 h-12 mx-auto border border-gray-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h4 className="font-semibold text-sm tracking-wide">편안한 핏</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            인체공학적 설계로 일상과 운동 모두에 적합한 핏을 제공합니다.
          </p>
        </div>
        <div className="text-center space-y-3 p-6">
          <div className="w-12 h-12 mx-auto border border-gray-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <h4 className="font-semibold text-sm tracking-wide">내구성</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            반복 세탁에도 형태와 색상이 유지되는 뛰어난 내구성을 자랑합니다.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-12">
        <div className="text-center space-y-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest">CARE INSTRUCTIONS</p>
          <p className="text-sm text-gray-500">
            찬물 세탁 권장 · 표백제 사용 금지 · 낮은 온도 건조 · 다림질 가능
          </p>
        </div>
      </div>
    </div>
  )
}

function ReviewContent() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center space-y-6 py-12">
        {/* Review Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-5 h-5 text-gray-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-400">아직 리뷰가 없습니다</p>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-500 mb-6">
            이 상품을 구매하셨나요? 첫 번째 리뷰를 작성해주세요.
          </p>
          <button className="px-8 py-3 border-2 border-black text-sm font-semibold tracking-wide hover:bg-black hover:text-white transition-colors">
            리뷰 작성하기
          </button>
        </div>
      </div>
    </div>
  )
}

function PolicyContent() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Shipping */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-bold">01</div>
          배송 안내
        </h3>
        <div className="pl-11 space-y-3 text-sm text-gray-600 leading-relaxed">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-gray-800">배송 방법</span>
            <span>택배 배송</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-gray-800">배송 지역</span>
            <span>전국</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-gray-800">배송비</span>
            <span>3,000원 (50,000원 이상 구매 시 무료배송)</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-gray-800">배송 기간</span>
            <span>결제 완료 후 1~3 영업일 이내 출고</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Exchange */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-bold">02</div>
          교환 안내
        </h3>
        <div className="pl-11 space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>상품 수령 후 7일 이내 교환 신청이 가능합니다.</p>
          <p className="font-medium text-gray-800">교환이 불가능한 경우:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>착용 흔적이 있는 경우</li>
            <li>택(Tag)이 제거된 경우</li>
            <li>세탁 또는 수선한 경우</li>
            <li>고객 부주의로 상품이 훼손된 경우</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Refund */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-bold">03</div>
          반품 / 환불 안내
        </h3>
        <div className="pl-11 space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>상품 수령 후 7일 이내 반품 신청이 가능합니다.</p>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-gray-800">반품 배송비</span>
            <span>고객 변심: 왕복 6,000원 / 상품 불량: 무료</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-medium text-gray-800">환불 소요</span>
            <span>반품 상품 수령 후 3~5 영업일 이내</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Contact */}
      <div className="bg-gray-50 p-6 text-center space-y-2">
        <p className="text-sm font-medium text-gray-800">추가 문의사항</p>
        <p className="text-xs text-gray-500">
          교환/반품 관련 문의는 고객센터 또는 마이페이지에서 접수해주세요.
        </p>
      </div>
    </div>
  )
}
