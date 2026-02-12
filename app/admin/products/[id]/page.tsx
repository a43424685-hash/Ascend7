import { notFound } from 'next/navigation'
import { getSupabaseClient } from '@/shared/api/supabaseClient'
import { ProductEditForm } from '@/widgets/admin/product-edit-form'
import { VariantsManager } from '@/widgets/admin/variants-manager'
import { ImagesManager } from '@/widgets/admin/images-manager'
import { DetailContentEditor } from '@/widgets/admin/detail-content-editor'
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
    images: (data.images || []).sort((a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0)),
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
      <h1 className="text-3xl font-bold mb-8">상품 수정</h1>

      <div className="space-y-8">
        {/* Product Info */}
        <div className="bg-white border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">상품 정보</h2>
          <ProductEditForm product={product} />
        </div>

        {/* Images */}
        <div className="bg-white border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">상품 이미지</h2>
          <ImagesManager productId={product.id} images={product.images} />
        </div>

        {/* Detail Content */}
        <div className="bg-white border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">상품 상세페이지</h2>
          <p className="text-sm text-gray-600 mb-4">
            고객에게 보여지는 상세 정보를 HTML 형식으로 작성합니다. 이미지, 텍스트 등을 자유롭게 구성할 수 있습니다.
          </p>
          <DetailContentEditor productId={product.id} initialContent={product.detail_content} />
        </div>

        {/* Variants */}
        <div className="bg-white border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">옵션 관리</h2>
          <VariantsManager productId={product.id} variants={product.variants} />
        </div>
      </div>
    </div>
  )
}
