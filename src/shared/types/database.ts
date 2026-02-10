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
  status: string
  total: number
  stripe_session_id: string | null
  created_at: string
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

