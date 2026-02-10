import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { Order, OrderItem } from '@/shared/types/database'

export type OrderWithItems = Order & {
  items: (OrderItem & {
    variant: {
      color: string
      size: string
      product: {
        name: string
        slug: string
      }
    }
  })[]
}

export async function getOrders(userId: string): Promise<OrderWithItems[]> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      items:order_items(
        *,
        variant:variants(
          color,
          size,
          product:products(name, slug)
        )
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  return (data || []) as OrderWithItems[]
}

