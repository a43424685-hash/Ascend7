import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/entities/product/api/get-product-by-slug'
import { ProductGallery } from '@/widgets/product-gallery'
import { ProductDetails } from '@/features/cart/product-details'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductDetails product={product} />
      </div>
    </div>
  )
}

