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

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded'

/**
 * 주문 배송 상태 업데이트
 */
export async function updateOrderFulfillment(
  orderId: string,
  fulfillmentStatus: FulfillmentStatus
) {
  try {
    // 관리자 권한 확인
    const admin = await requireAdmin()
    
    console.log(`📦 [ADMIN] Updating order fulfillment`, {
      orderId,
      fulfillmentStatus,
      adminId: admin.id,
      adminEmail: admin.email,
    })
    
    const supabase = await createClient()
    
    // 주문 상태 업데이트
    const { error } = await supabase
      .from('orders')
      .update({ 
        fulfillment_status: fulfillmentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
    
    if (error) {
      console.error(`❌ [ADMIN] Order fulfillment update failed`, {
        orderId,
        error: error.message,
      })
      return { success: false, error: error.message }
    }
    
    console.log(`✅ [ADMIN] Order fulfillment updated`, {
      orderId,
      fulfillmentStatus,
    })
    
    // 캐시 재검증
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error(`❌ [ADMIN] Update fulfillment error`, {
      orderId,
      error: error.message,
    })
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
    // 관리자 권한 확인
    const admin = await requireAdmin()
    
    console.log(`💳 [ADMIN] Updating order payment status`, {
      orderId,
      paymentStatus,
      adminId: admin.id,
      adminEmail: admin.email,
    })
    
    const supabase = await createClient()
    
    // 주문 상태 업데이트
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
    
    if (error) {
      console.error(`❌ [ADMIN] Order payment status update failed`, {
        orderId,
        error: error.message,
      })
      return { success: false, error: error.message }
    }
    
    console.log(`✅ [ADMIN] Order payment status updated`, {
      orderId,
      paymentStatus,
    })
    
    // 캐시 재검증
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error(`❌ [ADMIN] Update payment status error`, {
      orderId,
      error: error.message,
    })
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
    // 관리자 권한 확인
    const admin = await requireAdmin()
    
    console.log(`🚚 [ADMIN] Updating order tracking`, {
      orderId,
      trackingNumber,
      carrier: carrier || 'not provided',
      adminId: admin.id,
      adminEmail: admin.email,
    })
    
    const supabase = await createClient()
    
    // 운송장 정보 업데이트 + 배송 상태를 'shipped'로 변경
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
      console.error(`❌ [ADMIN] Order tracking update failed`, {
        orderId,
        error: error.message,
      })
      return { success: false, error: error.message }
    }
    
    console.log(`✅ [ADMIN] Order tracking updated`, {
      orderId,
      trackingNumber,
      carrier: carrier || 'none',
    })
    
    // 캐시 재검증
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error(`❌ [ADMIN] Update tracking error`, {
      orderId,
      error: error.message,
    })
    return { success: false, error: error.message }
  }
}

/**
 * 주문 취소 (재고 복구 포함)
 */
export async function cancelOrder(orderId: string) {
  try {
    // 관리자 권한 확인
    const admin = await requireAdmin()
    
    console.log(`❌ [ADMIN] Canceling order`, {
      orderId,
      adminId: admin.id,
      adminEmail: admin.email,
    })
    
    const supabase = await createClient()
    
    // 1. 주문 아이템 조회
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId)
    
    if (itemsError) {
      console.error(`❌ [ADMIN] Failed to fetch order items`, {
        orderId,
        error: itemsError.message,
      })
      return { success: false, error: itemsError.message }
    }
    
    // 2. 재고 복구
    for (const item of orderItems || []) {
      const { error: stockError } = await supabase.rpc('atomic_restore_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })
      
      if (stockError) {
        console.error(`⚠️ [ADMIN] Stock restore failed`, {
          orderId,
          variantId: item.variant_id,
          quantity: item.quantity,
          error: stockError.message,
        })
        // 재고 복구 실패해도 계속 진행
      }
    }
    
    // 3. 주문 상태 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        fulfillment_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
    
    if (updateError) {
      console.error(`❌ [ADMIN] Order cancellation failed`, {
        orderId,
        error: updateError.message,
      })
      return { success: false, error: updateError.message }
    }
    
    console.log(`✅ [ADMIN] Order canceled`, {
      orderId,
      itemsRestored: orderItems?.length || 0,
    })
    
    // 캐시 재검증
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error(`❌ [ADMIN] Cancel order error`, {
      orderId,
      error: error.message,
    })
    return { success: false, error: error.message }
  }
}

