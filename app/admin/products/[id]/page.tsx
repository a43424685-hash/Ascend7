import { notFound } from 'next/navigation'
import { getSupabaseClient } from '@/shared/api/supabaseClient'
import { ProductEditForm } from '@/widgets/admin/product-edit-form'
import { VariantsManager } from '@/widgets/admin/variants-manager'
import { ImagesManager } from '@/widgets/admin/images-manager'
import type { ProductWithDetails } from '@/shared/types/database'

async function getProduct(id: string): Promise<ProductWithDetails | null> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:variants(*)')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    ...data,
    images: (data.images || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    variants: data.variants || [],
  } as ProductWithDetails
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <div className="space-y-8">
        {/* Product Info */}
        <div className="bg-white border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Product Information</h2>
          <ProductEditForm product={product} />
        </div>

        {/* Images */}
        <div className="bg-white border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Product Images</h2>
          <ImagesManager productId={product.id} images={product.images} />
        </div>

        {/* Variants */}
        <div className="bg-white border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Variants</h2>
          <VariantsManager productId={product.id} variants={product.variants} />
        </div>
      </div>
    </div>
  )
}

