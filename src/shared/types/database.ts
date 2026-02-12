export type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  is_active: boolean
  created_at: string
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  sort_order: number
}

export type Variant = {
  id: string
  product_id: string
  sku: string
  color: string
  size: string
  price: number
  stock: number
  is_active: boolean
}

export type Order = {
  id: string
  user_id: string | null
  payment_status: string
  fulfillment_status: string
  total: number
  stripe_session_id: string | null
  tracking_number: string | null
  carrier: string | null
  shipping_address: Record<string, any> | null
  customer_email: string | null
  customer_name: string | null
  customer_phone: string | null
  created_at: string
  updated_at?: string
  // 반품/환불 관련
  return_status: string | null
  return_reason: string | null
  return_requested_at: string | null
  return_rejection_reason: string | null
  return_inspection_notes: string | null
  stripe_refund_id: string | null
  refund_amount: number | null
  refunded_at: string | null
}

export type OrderItem = {
  id: string
  order_id: string
  variant_id: string
  quantity: number
  price: number
}

export type ProductWithImages = Product & {
  images: ProductImage[]
  variants?: Variant[]
}

export type ProductWithDetails = ProductWithImages & {
  variants: Variant[]
}

export type CartItem = {
  variant_id: string
  product_id: string
  product_name: string
  product_slug: string
  variant_sku: string
  color: string
  size: string
  price: number
  quantity: number
  image_url: string | null
}

