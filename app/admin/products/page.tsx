import Link from 'next/link'
import { getAllProductsAdmin } from '@/entities/product/api/get-all-products-admin'
import { Button } from '@/shared/ui/button'
import { formatPrice } from '@/shared/lib/utils'

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>+ New Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-gray-200">
          <p className="text-gray-600 mb-4">No products yet</p>
          <Link href="/admin/products/new">
            <Button>Create First Product</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">Product</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Variants</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0
                )
                const minPrice = Math.min(
                  ...product.variants.map((v) => v.price)
                )
                const maxPrice = Math.max(
                  ...product.variants.map((v) => v.price)
                )

                return (
                  <tr key={product.id} className="border-b border-gray-200">
                    <td className="p-4">
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {minPrice === maxPrice
                          ? formatPrice(minPrice)
                          : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                      </div>
                    </td>
                    <td className="p-4 capitalize">{product.category}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        {product.variants.length} variants
                      </div>
                      <div className="text-sm text-gray-600">
                        Stock: {totalStock}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

