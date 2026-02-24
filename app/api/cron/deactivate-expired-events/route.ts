import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * 만료 이벤트 자동 비활성화 Cron Job
 * - 매 시간 정각 실행: "0 * * * *"
 * - ends_at < now() AND is_active = true 인 이벤트를 is_active = false 처리
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('events')
    .update({ is_active: false })
    .lt('ends_at', new Date().toISOString())
    .eq('is_active', true)
    .not('ends_at', 'is', null)
    .select('id, title, ends_at')

  if (error) {
    console.error('[DEACTIVATE_EVENTS_CRON] Update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const count = data?.length ?? 0
  if (count > 0) {
    data.forEach((e) => {
      console.log(`✅ [DEACTIVATE_EVENTS_CRON] 비활성화: ${e.title} (ends_at: ${e.ends_at})`)
    })
  }

  return NextResponse.json({
    success: true,
    deactivated: count,
    events: data?.map((e) => ({ id: e.id, title: e.title })) ?? [],
  })
}
