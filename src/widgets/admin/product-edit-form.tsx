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
      })
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
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
          Product updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Name *</label>
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
          <label className="block text-sm font-semibold mb-1">Slug *</label>
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
        <label className="block text-sm font-semibold mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Category *</label>
          <select
            required
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="accessories">Accessories</option>
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
            Active (visible to customers)
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          Back to List
        </Button>
      </div>
    </form>
  )
}

