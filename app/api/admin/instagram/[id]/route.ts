import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { checkAdminAuth } from '@/shared/lib/auth/admin'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isAdmin } = await checkAdminAuth()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('instagram_posts')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
