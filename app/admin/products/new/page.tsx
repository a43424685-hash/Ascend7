'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/entities/product/api/create-product'
import { Button } from '@/shared/ui/button'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'top',
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const product = await createProduct(formData)
      router.push(`/admin/products/${product.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }))
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">New Product</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black outline-none"
            placeholder="e.g. Training Gloves"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold mb-2">Slug *</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black outline-none"
            placeholder="e.g. training-gloves"
          />
          <p className="text-sm text-gray-600 mt-1">
            Used in URL: /product/{formData.slug || 'slug'}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black outline-none"
            placeholder="Product description..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold mb-2">Category *</label>
          <select
            required
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black outline-none"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        {/* Active */}
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
            Active (visible to customers)
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 text-sm">
        <p className="font-semibold text-blue-900 mb-2">Next Steps:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-800">
          <li>Create the product</li>
          <li>Upload product images</li>
          <li>Add variants (color/size combinations with price & stock)</li>
        </ol>
      </div>
    </div>
  )
}

