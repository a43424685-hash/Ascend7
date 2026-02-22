import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { checkAdminAuth } from '@/shared/lib/auth/admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('bundle_deals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bundles: data || [] })
}

export async function POST(req: NextRequest) {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('bundle_deals')
    .insert({
      name: body.name,
      description: body.description || null,
      product_slugs: body.product_slugs || [],
      discount_percent: body.discount_percent || 0,
      discount_fixed: body.discount_fixed || 0,
      min_items: body.min_items || 2,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bundle: data })
}
