import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { checkAdminAuth } from '@/shared/lib/auth/admin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('bundle_deals')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bundle: data })
}
