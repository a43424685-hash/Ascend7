'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import type { CartStorageItem, CartItemWithVariant } from '@/shared/types/cart'

/**
 * 서버 액션 기반 장바구니 아이템 조회
 * Admin 클라이언트 사용 → RLS 우회, 환경변수 이슈 없음
 */
export async function getCartItemsServer(
  cartStorageItems: CartStorageItem[]
): Promise<CartItemWithVariant[]> {
  if (cartStorageItems.length === 0) {
    return []
  }

  const supabase = createAdminClient()
  const variantIds = cartStorageItems.map((item) => item.variant_id)

  const { data, error } = await supabase
    .from('variants')
    .select(
      `
      *,
      product:products(
        id,
        slug,
        name,
        images:product_images(url, sort_order)
      )
    `
    )
    .in('id', variantIds)
    .eq('is_active', true)

  if (error) {
    throw new Error(`장바구니 데이터를 불러올 수 없습니다: ${error.message}`)
  }

  if (!data) {
    return []
  }

  const cartItems: CartItemWithVariant[] = cartStorageItems
    .map((storageItem) => {
      const variant = data.find((v) => v.id === storageItem.variant_id)

      if (!variant || !variant.product) {
        return null
      }

      const images = (variant.product as any).images || []
      const sortedImages = images.sort(
        (a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
      )
      const imageUrl = sortedImages[0]?.url || null

      return {
        variant_id: storageItem.variant_id,
        quantity: storageItem.quantity,
        variant: {
          id: variant.id,
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          price: variant.price,
          stock: variant.stock,
          product_id: variant.product_id,
        },
        product: {
          id: (variant.product as any).id,
          slug: (variant.product as any).slug,
          name: (variant.product as any).name,
        },
        image_url: imageUrl,
      }
    })
    .filter((item): item is CartItemWithVariant => item !== null)

  return cartItems
}
