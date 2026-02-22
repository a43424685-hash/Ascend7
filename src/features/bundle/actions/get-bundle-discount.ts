'use server'

import { createAdminClient } from '@/shared/lib/supabase/admin'

interface CartItem {
  productSlug?: string
  quantity: number
  price: number
}

interface BundleDiscount {
  bundleId: string
  bundleName: string
  discountAmount: number
  description: string
}

export async function getBundleDiscount(
  items: CartItem[],
  subtotal: number
): Promise<BundleDiscount | null> {
  try {
    const supabase = createAdminClient()

    const { data: bundles } = await supabase
      .from('bundle_deals')
      .select('*')
      .eq('is_active', true)

    if (!bundles || bundles.length === 0) return null

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const slugsInCart = items.map((i) => i.productSlug).filter(Boolean)

    for (const bundle of bundles) {
      let applies = false

      if (!bundle.product_slugs || bundle.product_slugs.length === 0) {
        // 모든 상품 기준 - 총 수량으로 판단
        applies = totalItems >= bundle.min_items
      } else {
        // 특정 상품 기준
        const matchingItems = bundle.product_slugs.filter((slug: string) =>
          slugsInCart.includes(slug)
        )
        applies = matchingItems.length >= bundle.min_items
      }

      if (applies) {
        let discountAmount = 0
        if (bundle.discount_percent > 0) {
          discountAmount = Math.floor(subtotal * (bundle.discount_percent / 100))
        } else if (bundle.discount_fixed > 0) {
          discountAmount = bundle.discount_fixed
        }

        if (discountAmount > 0) {
          return {
            bundleId: bundle.id,
            bundleName: bundle.name,
            discountAmount,
            description: bundle.description || `${bundle.name} 할인`,
          }
        }
      }
    }

    return null
  } catch {
    return null
  }
}
