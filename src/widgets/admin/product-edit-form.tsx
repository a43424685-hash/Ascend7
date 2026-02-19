'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProduct } from '@/entities/product/api/update-product'
import { Button } from '@/shared/ui/button'
import type { ProductWithDetails } from '@/shared/types/database'

interface ProductEditFormProps {
  product: ProductWithDetails
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
    size_chart: product.size_chart || '',
    size_material_care: product.size_material_care || '',
    category: product.category,
    is_active: product.is_active,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProduct({
        id: product.id,
        ...formData,
        size_chart: formData.size_chart || null,
        size_material_care: formData.size_material_care || null,
      })
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '상품 수정에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">슬러그 *</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">간단 설명</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
        />
      </div>

      {/* 사이즈 차트 */}
      <div className="border border-gray-200 rounded p-4 space-y-2">
        <label className="block text-sm font-semibold">사이즈 차트</label>
        <p className="text-xs text-gray-400">
          첫 줄에 헤더, 이후 각 줄에 사이즈 데이터를 <code className="bg-gray-100 px-1">|</code>로 구분해 입력하세요.
        </p>
        <textarea
          value={formData.size_chart}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, size_chart: e.target.value }))
          }
          rows={7}
          placeholder={'사이즈|총장|어깨|가슴|소매\nS|67|44|104|62\nM|69|46|108|63\nL|71|48|112|64\nXL|73|50|116|65'}
          className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none font-mono text-sm"
        />
        <p className="text-xs text-gray-400">→ 상품 페이지에서 자동으로 표(테이블)로 변환되어 표시됩니다.</p>
      </div>

      {/* 소재 / 세탁 안내 */}
      <div className="border border-gray-200 rounded p-4 space-y-2">
        <label className="block text-sm font-semibold">소재 / 세탁 안내</label>
        <p className="text-xs text-gray-400">
          줄바꿈이 그대로 반영됩니다.
        </p>
        <textarea
          value={formData.size_material_care}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, size_material_care: e.target.value }))
          }
          rows={6}
          placeholder={'나일론 80% / 스판덱스 20%\n\n[세탁 안내]\n- 찬물 또는 미지근한 물에서 단독 세탁\n- 표백제 사용 금지\n- 낮은 온도에서 건조'}
          className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">카테고리 *</label>
          <select
            required
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
          >
            <option value="top">상의</option>
            <option value="bottom">하의</option>
            <option value="accessories">액세서리</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
            }
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
