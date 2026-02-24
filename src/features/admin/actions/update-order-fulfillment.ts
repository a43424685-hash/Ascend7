'use server'

/**
 * 관리자 주문 배송 상태 업데이트 Server Actions
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import { requireAdmin } from '@/shared/lib/auth/admin'
import { sendShippingNotification, type EmailOrderData } from '@/shared/lib/email'
import { sendShippingAlimtalk, sendOrderCancelAlimtalk } from '@/shared/lib/solapi'
import { formatPrice } from '@/shared/lib/utils'

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
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/account')

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
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/account')

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
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    // 배송 시작 이메일 + 알림톡 발송
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, customer_email, customer_name, total, user_id')
        .eq('id', orderId)
        .single()

      if (order?.customer_email) {
        const { data: items } = await supabase
          .from('order_items')
          .select('quantity, price, variant:variants(color, size, product:products(name))')
          .eq('order_id', orderId)

        const emailData: EmailOrderData = {
          orderNumber: order.order_number || orderId.slice(0, 8),
          customerName: order.customer_name || '고객',
          customerEmail: order.customer_email,
          total: formatPrice(order.total),
          trackingNumber,
          carrier: carrier || undefined,
          items: (items || []).map((item: any) => {
            const v = Array.isArray(item.variant) ? item.variant[0] : item.variant
            const p = v && (Array.isArray(v.product) ? v.product[0] : v.product)
            return {
              name: p?.name || '상품',
              option: v ? `${v.color} / ${v.size}` : '-',
              quantity: item.quantity,
              price: formatPrice(item.price * item.quantity),
            }
          }),
        }

        await sendShippingNotification(emailData)

        // 카카오 알림톡 (회원 전화번호 조회)
        if (order.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', order.user_id)
            .single()

          if (profile?.phone) {
            await sendShippingAlimtalk({
              to: profile.phone,
              customerName: order.customer_name || '고객',
              orderNumber: order.order_number || orderId.slice(0, 8),
              carrier: carrier || '택배',
              trackingNumber,
            })
          }
        }
      }
    } catch (emailErr: any) {
      console.error('⚠️ [NOTIFY] Shipping notification failed (non-blocking):', emailErr.message)
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/account')

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
      })
      .eq('id', orderId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // 주문 취소 알림톡 (비동기, 실패해도 취소는 완료)
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, customer_name, total, user_id')
        .eq('id', orderId)
        .single()

      if (order?.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', order.user_id)
          .single()

        if (profile?.phone) {
          await sendOrderCancelAlimtalk({
            to: profile.phone,
            customerName: order.customer_name || '고객',
            orderNumber: order.order_number || orderId.slice(0, 8),
            refundAmount: formatPrice(order.total),
          })
        }
      }
    } catch (alimtalkErr: any) {
      console.error('⚠️ [ALIMTALK] Cancel notification failed (non-blocking):', alimtalkErr.message)
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/account')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
