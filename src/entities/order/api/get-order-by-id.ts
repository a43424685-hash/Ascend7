import { getSupabaseClient } from '@/shared/api/supabaseClient'
import type { Order, OrderItem } from '@/shared/types/database'

export type OrderDetailWithItems = Order & {
  items: (OrderItem & {
    variant: {
      sku: string
      color: string
      size: string
      product: {
        id: string
        name: string
        slug: string
      }
    }
  })[]
}

/**
 * 주문 ID로 주문 상세 조회
 * - user_id 검증을 통해 본인 주문만 조회 가능
 */
export async function getOrderById(
  orderId: string,
  userId: string
): Promise<OrderDetailWithItems | null> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      items:order_items(
        *,
        variant:variants(
          sku,
          color,
          size,
          product:products(id, name, slug)
        )
      )
    `
    )
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data as OrderDetailWithItems
}
