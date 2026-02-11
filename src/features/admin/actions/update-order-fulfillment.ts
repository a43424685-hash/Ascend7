'use server'

/**
 * 관리자 주문 배송 상태 업데이트 Server Actions
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import { requireAdmin } from '@/shared/lib/auth/admin'

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'canceled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

/**
 * 주문 배송 상태 업데이트
 */
export async function updateOrderFulfillment(
  orderId: string,
  fulfillmentStatus: FulfillmentStatus
) {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { error } = await supabase
      .from('orders')
      .update({
        fulfillment_status: fulfillmentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 주문 결제 상태 업데이트
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
) {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 주문 운송장 정보 업데이트
 */
export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string,
  carrier?: string
) {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { error } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        carrier: carrier || null,
        fulfillment_status: 'shipped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 주문 취소 (재고 복구 포함)
 */
export async function cancelOrder(orderId: string) {
  try {
    await requireAdmin()

    const supabase = await createClient()

    // 주문 아이템 조회
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId)

    if (itemsError) {
      return { success: false, error: itemsError.message }
    }

    // 재고 복구
    for (const item of orderItems || []) {
      await supabase.rpc('atomic_restore_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })
    }

    // 주문 상태 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        fulfillment_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
