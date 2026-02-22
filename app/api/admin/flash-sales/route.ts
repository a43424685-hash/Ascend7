import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { checkAdminAuth } from '@/shared/lib/auth/admin'

export async function POST(req: NextRequest) {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, product_slug, variant_sku, sale_price, original_price, end_at, max_quantity } = body

  const supabase = createAdminClient()

  // 상품 조회
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('slug', product_slug)
    .single()

  if (!product) {
    return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 })
  }

  // 바리에이션 조회 (선택)
  let variantId: string | null = null
  if (variant_sku) {
    const { data: variant } = await supabase
      .from('variants')
      .select('id')
      .eq('sku', variant_sku)
      .single()
    variantId = variant?.id || null
  }

  const discountPercent = Math.round((1 - sale_price / original_price) * 100)

  const { data, error } = await supabase
    .from('flash_sales')
    .insert({
      title,
      product_id: product.id,
      variant_id: variantId,
      sale_price,
      original_price,
      discount_percent: discountPercent,
      end_at,
      max_quantity: max_quantity || null,
      sold_quantity: 0,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
