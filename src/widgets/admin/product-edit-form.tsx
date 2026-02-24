'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct } from '@/entities/product/api/update-product'
import { Button } from '@/shared/ui/button'
import { SizeChartEditor } from '@/widgets/admin/size-chart-editor'
import { RichTextEditor } from '@/shared/ui/rich-text-editor'
import { MaterialCareEditor } from '@/widgets/admin/material-care-editor'
import type { ProductWithDetails } from '@/shared/types/database'

interface ProductEditFormProps {
  product: ProductWithDetails
}

const SUB_OPTIONS: Record<string, { value: string; label: string }[]> = {
  top: [
    { value: 'hoodie', label: '후디 (HOODIE)' },
    { value: 'sweater', label: '스웨터 (SWEATER)' },
    { value: 'tshirts', label: '티셔츠 (T-SHIRTS)' },
    { value: 'longsleeve', label: '긴소매 (LONG SLEEVE)' },
    { value: 'sleeveless', label: '민소매 (SLEEVELESS)' },
  ],
  bottom: [
    { value: 'shorts', label: '반바지 (SHORTS)' },
    { value: 'pants', label: '팬츠 (PANTS)' },
  ],
  accessories: [
    { value: 'cap', label: '캡 (CAP)' },
    { value: 'socks', label: '양말 (SOCKS)' },
    { value: 'bag', label: '가방 (BAG)' },
  ],
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    detail_content: product.detail_content || '',
    size_material_care: product.size_material_care || '',
    category: product.category,
    sub_category: product.sub_category || '',
    is_active: product.is_active,
  })
  const [sizeChart, setSizeChart] = useState<string | null>(product.size_chart)
  const [material, setMaterial] = useState<string | null>(product.material ?? null)
  const [careInstructions, setCareInstructions] = useState<string[] | null>(
    product.care_instructions ?? null
  )

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({ ...prev, category, sub_category: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProduct({
        id: product.id,
        ...formData,
        sub_category: formData.sub_category || null,
        size_chart: sizeChart,
        detail_content: formData.detail_content || undefined,
        size_material_care: formData.size_material_care || null,
        material,
        care_instructions: careInstructions,
      })
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '상품 수정에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const subOptions = SUB_OPTIONS[formData.category] ?? null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
          상품이 수정되었습니다.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">상품명 *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">슬러그 *</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">간단 설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
        />
      </div>

      {/* 상품 상세 설명 */}
      <div className="border border-gray-200 rounded p-4 space-y-2">
        <div>
          <label className="block text-sm font-semibold">상품 상세 설명</label>
          <p className="text-xs text-gray-400 mt-0.5">상품 페이지 &ldquo;상품 상세&rdquo; 탭에 표시됩니다.</p>
        </div>
        <RichTextEditor
          value={formData.detail_content}
          onChange={(html) => setFormData((prev) => ({ ...prev, detail_content: html }))}
          minHeight={200}
        />
      </div>

      {/* 사이즈 차트 */}
      <div className="border border-gray-200 rounded p-4 space-y-3">
        <div>
          <label className="block text-sm font-semibold">사이즈 차트</label>
          <p className="text-xs text-gray-400 mt-0.5">
            상품 페이지 &ldquo;사이즈 / 소재 / 세탁 안내&rdquo; 탭에 표로 표시됩니다.
          </p>
        </div>
        <SizeChartEditor value={sizeChart} onChange={setSizeChart} />
      </div>

      {/* 소재 / 세탁 안내 */}
      <div className="border border-gray-200 rounded p-4 space-y-3">
        <div>
          <label className="block text-sm font-semibold">소재 / 세탁 안내</label>
          <p className="text-xs text-gray-400 mt-0.5">소재를 선택하고 비율(%)을 입력한 뒤, 세탁 방법을 선택하세요.</p>
        </div>
        <MaterialCareEditor
          material={material}
          careInstructions={careInstructions}
          onMaterialChange={setMaterial}
          onCareChange={setCareInstructions}
        />
      </div>

      {/* 카테고리 + 서브카테고리 + 활성 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">카테고리 *</label>
          <select
            required
            value={formData.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
          >
            <option value="outer">아우터 (OUTER)</option>
            <option value="top">상의 (TOP)</option>
            <option value="bottom">하의 (BOTTOM)</option>
            <option value="accessories">액세서리 (ACC)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            세부 카테고리
            {!subOptions && <span className="text-gray-400 font-normal"> (해당 없음)</span>}
          </label>
          <select
            value={formData.sub_category}
            onChange={(e) => setFormData((prev) => ({ ...prev, sub_category: e.target.value }))}
            disabled={!subOptions}
            className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">미지정</option>
            {subOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
            className="w-4 h-4"
          />
          <label htmlFor="is_active" className="text-sm font-semibold">
            활성 (고객에게 노출)
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? '저장 중...' : '변경사항 저장'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          목록으로
        </Button>
      </div>
    </form>
  )
}
