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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
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
      setError(err instanceof Error ? err.message : 'Failed to create variant')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this variant?')) return

    setLoading(true)
    try {
      await deleteVariant(id, productId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete variant')
    } finally {
      setLoading(false)
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
        <div className="border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 font-semibold">SKU</th>
                <th className="text-left p-3 font-semibold">Color</th>
                <th className="text-left p-3 font-semibold">Size</th>
                <th className="text-left p-3 font-semibold">Price</th>
                <th className="text-left p-3 font-semibold">Stock</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-b border-gray-200">
                  <td className="p-3">{variant.sku}</td>
                  <td className="p-3">{variant.color}</td>
                  <td className="p-3">{variant.size}</td>
                  <td className="p-3">{formatPrice(variant.price)}</td>
                  <td className="p-3">{variant.stock}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        variant.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {variant.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(variant.id)}
                      disabled={loading}
                      className="text-red-600 hover:underline text-sm disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Variant Form */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="border border-gray-300 p-4 space-y-3">
          <h3 className="font-semibold mb-2">Add New Variant</h3>
          
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
                placeholder="e.g. TG-BLK-M"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color *</label>
              <input
                type="text"
                required
                value={newVariant.color}
                onChange={(e) =>
                  setNewVariant((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-full px-2 py-1 border border-gray-300 text-sm"
                placeholder="e.g. Black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Size *</label>
              <input
                type="text"
                required
                value={newVariant.size}
                onChange={(e) =>
                  setNewVariant((prev) => ({ ...prev, size: e.target.value }))
                }
                className="w-full px-2 py-1 border border-gray-300 text-sm"
                placeholder="e.g. M"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (₩) *</label>
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
              <label className="block text-sm font-medium mb-1">Stock *</label>
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
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} size="sm">
              {loading ? 'Adding...' : 'Add Variant'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">
          + Add Variant
        </Button>
      )}

      {variants.length === 0 && !isAdding && (
        <p className="text-sm text-gray-600 py-4">
          No variants yet. Add at least one variant to make this product available for
          purchase.
        </p>
      )}
    </div>
  )
}

