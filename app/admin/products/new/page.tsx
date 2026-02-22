'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/entities/product/api/create-product'
import { Button } from '@/shared/ui/button'

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

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'top',
    sub_category: '',
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const product = await createProduct({
        ...formData,
        sub_category: formData.sub_category || null,
      })
      router.push(`/admin/products/${product.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '상품 생성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }))
  }

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({ ...prev, category, sub_category: '' }))
  }

  const subOptions = SUB_OPTIONS[formData.category] ?? null

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">새 상품 등록</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">상품명 *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black outline-none"
            placeholder="예: Training Hoodie"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">슬러그 *</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black outline-none"
            placeholder="예: training-hoodie"
          />
          <p className="text-sm text-gray-600 mt-1">
            URL에 사용됩니다: /product/{formData.slug || 'slug'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">간단 설명</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black outline-none"
            placeholder="상품에 대한 간단한 설명..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">카테고리 *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black outline-none"
            >
              <option value="outer">아우터 (OUTER)</option>
              <option value="top">상의 (TOP)</option>
              <option value="bottom">하의 (BOTTOM)</option>
              <option value="accessories">액세서리 (ACC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              세부 카테고리
              {!subOptions && <span className="text-gray-400 font-normal"> (해당 없음)</span>}
            </label>
            <select
              value={formData.sub_category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sub_category: e.target.value }))
              }
              disabled={!subOptions}
              className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black outline-none disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">미지정</option>
              {subOptions?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="w-5 h-5"
          />
          <label htmlFor="is_active" className="text-sm font-semibold">
            활성 (고객에게 노출)
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? '생성 중...' : '상품 등록'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            취소
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 text-sm">
        <p className="font-semibold text-blue-900 mb-2">다음 단계:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-800">
          <li>상품을 등록합니다</li>
          <li>상품 이미지를 업로드합니다</li>
          <li>옵션(색상/사이즈)을 추가합니다</li>
        </ol>
      </div>
    </div>
  )
}
