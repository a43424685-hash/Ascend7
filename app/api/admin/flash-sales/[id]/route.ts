import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { checkAdminAuth } from '@/shared/lib/auth/admin'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('flash_sales')
    .select(`
      id, title, sale_price, original_price, discount_percent,
      end_at, max_quantity, sold_quantity, is_active,
      product:products (id, name),
      variant:variants (id, color, size)
    `)
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const product = Array.isArray(data.product) ? (data.product as any[])[0] : data.product
  const variant = Array.isArray(data.variant) ? (data.variant as any[])[0] : data.variant

  return NextResponse.json({
    ...data,
    product_name: product?.name ?? '',
    variant_info: variant ? `${variant.color} / ${variant.size}` : '',
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, sale_price, original_price, end_at, max_quantity, is_active } = body

  const supabase = createAdminClient()
  const discountPercent = Math.round((1 - sale_price / original_price) * 100)

  const { data, error } = await supabase
    .from('flash_sales')
    .update({
      title,
      sale_price,
      original_price,
      discount_percent: discountPercent,
      end_at,
      max_quantity: max_quantity ?? null,
      ...(is_active !== undefined ? { is_active } : {}),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('flash_sales').delete().eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
