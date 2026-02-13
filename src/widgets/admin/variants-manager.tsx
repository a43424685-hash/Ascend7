'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createVariant } from '@/entities/variant/api/create-variant'
import { updateVariant } from '@/entities/variant/api/update-variant'
import { deleteVariant } from '@/entities/variant/api/delete-variant'
import { Button } from '@/shared/ui/button'
import { formatPrice } from '@/shared/lib/utils'
import type { Variant } from '@/shared/types/database'

interface VariantsManagerProps {
  productId: string
  variants: Variant[]
}

export function VariantsManager({ productId, variants }: VariantsManagerProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stockLoading, setStockLoading] = useState<string | null>(null)
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [editingStockValue, setEditingStockValue] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const [newVariant, setNewVariant] = useState({
    sku: '',
    color: '',
    size: '',
    price: 0,
    stock: 0,
    is_active: true,
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createVariant({
        product_id: productId,
        ...newVariant,
      })
      setIsAdding(false)
      setNewVariant({
        sku: '',
        color: '',
        size: '',
        price: 0,
        stock: 0,
        is_active: true,
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '옵션 생성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 옵션을 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      await deleteVariant(id, productId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '옵션 삭제에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleStockChange = async (variant: Variant, delta: number) => {
    const newStock = Math.max(0, variant.stock + delta)
    if (newStock === variant.stock) return

    setStockLoading(variant.id)
    try {
      await updateVariant({
        id: variant.id,
        product_id: productId,
        stock: newStock,
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '재고 변경에 실패했습니다')
    } finally {
      setStockLoading(null)
    }
  }

  const handleStockDirectEdit = async (variant: Variant) => {
    if (editingStockValue === variant.stock) {
      setEditingStockId(null)
      return
    }
    const newStock = Math.max(0, editingStockValue)
    setStockLoading(variant.id)
    try {
      await updateVariant({
        id: variant.id,
        product_id: productId,
        stock: newStock,
      })
      setEditingStockId(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '재고 변경에 실패했습니다')
    } finally {
      setStockLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Variants List */}
      {variants.length > 0 && (
        <>
          {/* 모바일: 카드 레이아웃 */}
          <div className="sm:hidden space-y-3">
            {variants.map((variant) => (
              <div key={variant.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{variant.color} / {variant.size}</p>
                    <p className="text-xs text-gray-500 font-mono">{variant.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${variant.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {variant.is_active ? '활성' : '비활성'}
                    </span>
                    <button
                      onClick={() => handleDelete(variant.id)}
                      disabled={loading}
                      className="text-red-500 text-xs disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{formatPrice(variant.price)}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 mr-1">재고</span>
                    <button
                      onClick={() => handleStockChange(variant, -1)}
                      disabled={stockLoading === variant.id || variant.stock <= 0}
                      className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-gray-50 text-sm font-bold disabled:opacity-40"
                    >
                      -
                    </button>
                    {editingStockId === variant.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editingStockValue}
                        onChange={(e) => setEditingStockValue(parseInt(e.target.value) || 0)}
                        onBlur={() => handleStockDirectEdit(variant)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleStockDirectEdit(variant)
                          if (e.key === 'Escape') setEditingStockId(null)
                        }}
                        autoFocus
                        className="w-12 h-7 text-center border border-blue-400 rounded text-sm outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingStockId(variant.id); setEditingStockValue(variant.stock) }}
                        className="w-12 h-7 text-center border border-gray-200 rounded text-sm hover:border-blue-400 cursor-text"
                        title="클릭하여 직접 입력"
                      >
                        {stockLoading === variant.id ? '...' : variant.stock}
                      </button>
                    )}
                    <button
                      onClick={() => handleStockChange(variant, 1)}
                      disabled={stockLoading === variant.id}
                      className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-gray-50 text-sm font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크탑: 테이블 레이아웃 */}
          <div className="hidden sm:block border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-semibold">SKU</th>
                  <th className="text-left p-3 font-semibold">색상</th>
                  <th className="text-left p-3 font-semibold">사이즈</th>
                  <th className="text-left p-3 font-semibold">가격</th>
                  <th className="text-left p-3 font-semibold">재고</th>
                  <th className="text-left p-3 font-semibold">상태</th>
                  <th className="text-right p-3 font-semibold">관리</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id} className="border-b border-gray-200">
                    <td className="p-3">{variant.sku}</td>
                    <td className="p-3">{variant.color}</td>
                    <td className="p-3">{variant.size}</td>
                    <td className="p-3">{formatPrice(variant.price)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStockChange(variant, -1)}
                          disabled={stockLoading === variant.id || variant.stock <= 0}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 bg-gray-50 hover:bg-gray-100 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        {editingStockId === variant.id ? (
                          <input
                            type="number"
                            min="0"
                            value={editingStockValue}
                            onChange={(e) => setEditingStockValue(parseInt(e.target.value) || 0)}
                            onBlur={() => handleStockDirectEdit(variant)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleStockDirectEdit(variant)
                              if (e.key === 'Escape') setEditingStockId(null)
                            }}
                            autoFocus
                            className="w-14 h-7 text-center border border-blue-400 text-sm outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => {
                              setEditingStockId(variant.id)
                              setEditingStockValue(variant.stock)
                            }}
                            className="w-14 h-7 text-center border border-gray-200 text-sm hover:border-blue-400 hover:bg-blue-50 cursor-text"
                            title="클릭하여 직접 입력"
                          >
                            {stockLoading === variant.id ? '...' : variant.stock}
                          </button>
                        )}
                        <button
                          onClick={() => handleStockChange(variant, 1)}
                          disabled={stockLoading === variant.id}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 bg-gray-50 hover:bg-gray-100 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          variant.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {variant.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(variant.id)}
                        disabled={loading}
                        className="text-red-600 hover:underline text-sm disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add New Variant Form */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="border border-gray-300 p-4 space-y-3">
          <h3 className="font-semibold mb-2">새 옵션 추가</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">SKU *</label>
              <input
                type="text"
                required
                value={newVariant.sku}
                onChange={(e) =>
                  setNewVariant((prev) => ({ ...prev, sku: e.target.value }))
                }
                className="w-full px-2 py-1 border border-gray-300 text-sm"
                placeholder="예: TG-BLK-M"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">색상 *</label>
              <input
                type="text"
                required
                value={newVariant.color}
                onChange={(e) =>
                  setNewVariant((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-full px-2 py-1 border border-gray-300 text-sm"
                placeholder="예: Black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">사이즈 *</label>
              <input
                type="text"
                required
                value={newVariant.size}
                onChange={(e) =>
                  setNewVariant((prev) => ({ ...prev, size: e.target.value }))
                }
                className="w-full px-2 py-1 border border-gray-300 text-sm"
                placeholder="예: M"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">가격 (₩) *</label>
              <input
                type="number"
                required
                min="0"
                value={newVariant.price}
                onChange={(e) =>
                  setNewVariant((prev) => ({
                    ...prev,
                    price: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-2 py-1 border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">재고 *</label>
              <input
                type="number"
                required
                min="0"
                value={newVariant.stock}
                onChange={(e) =>
                  setNewVariant((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-2 py-1 border border-gray-300 text-sm"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newVariant.is_active}
                  onChange={(e) =>
                    setNewVariant((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">활성</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} size="sm">
              {loading ? '추가 중...' : '옵션 추가'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(false)}
              disabled={loading}
            >
              취소
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">
          + 옵션 추가
        </Button>
      )}

      {variants.length === 0 && !isAdding && (
        <p className="text-sm text-gray-600 py-4">
          옵션이 없습니다. 상품을 판매하려면 최소 하나의 옵션을 추가하세요.
        </p>
      )}
    </div>
  )
}
