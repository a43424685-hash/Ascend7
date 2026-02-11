'use client'

import { createClient } from '@/shared/lib/supabase/client'
import type { CartStorageItem } from '@/shared/types/cart'
import type { CartItemWithVariant } from '@/shared/types/cart'

/**
 * 클라이언트 컴포넌트에서 사용하는 장바구니 아이템 조회
 * localStorage의 장바구니 데이터를 기반으로
 * Supabase에서 variant 정보를 조회하여 반환
 */
export async function getCartItemsClient(
  cartStorageItems: CartStorageItem[]
): Promise<CartItemWithVariant[]> {
  if (cartStorageItems.length === 0) {
    return []
  }

  const supabase = createClient()
  const variantIds = cartStorageItems.map((item) => item.variant_id)

  // Variants와 관련된 Product, ProductImage 조회
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
    console.error('장바구니 variant 조회 실패:', error)
    throw new Error(`장바구니 데이터를 불러올 수 없습니다: ${error.message}`)
  }

  if (!data) {
    return []
  }

  // CartStorageItem과 조회한 variant를 매칭
  const cartItems: CartItemWithVariant[] = cartStorageItems
    .map((storageItem) => {
      const variant = data.find((v) => v.id === storageItem.variant_id)

      if (!variant || !variant.product) {
        return null
      }

      // 이미지 URL 추출 (첫 번째 이미지)
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

