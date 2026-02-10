/**
 * localStorage에 저장되는 최소한의 장바구니 데이터
 */
export type CartStorageItem = {
  variant_id: string
  quantity: number
}

/**
 * Supabase에서 조회한 variant 정보를 포함한 장바구니 아이템
 */
export type CartItemWithVariant = {
  variant_id: string
  quantity: number
  variant: {
    id: string
    sku: string
    color: string
    size: string
    price: number
    stock: number
    product_id: string
  }
  product: {
    id: string
    slug: string
    name: string
  }
  image_url: string | null
}

