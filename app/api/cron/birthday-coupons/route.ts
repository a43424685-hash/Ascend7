import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/shared/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * 생일 쿠폰 Cron Job
 * - 매일 오전 9시 KST (0 0 * * * UTC) 실행
 * - 오늘 생일인 회원에게 3,000P 자동 지급
 * - 연 1회 중복 지급 방지
 */
export async function GET(req: NextRequest) {
  // Vercel Cron 인증 (CRON_SECRET 환경변수)
  // CRON_SECRET 미설정 시 fail-secure (undefined 우회 방지)
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()
  const year = now.getFullYear()

  // 오늘 생일인 회원 조회 (월/일 기준)
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, display_name, birthday')
    .not('birthday', 'is', null)
    .filter('birthday', 'ilike', `%-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)

  if (error) {
    console.error('[BIRTHDAY_CRON] Profile query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const birthdayDescription = `생일 축하 3000P (${year}년)`
  let awarded = 0
  let skipped = 0

  for (const profile of profiles || []) {
    // 올해 이미 지급했는지 확인
    const { data: existing } = await supabase
      .from('point_transactions')
      .select('id')
      .eq('user_id', profile.id)
      .eq('type', 'earn')
      .eq('description', birthdayDescription)
      .single()

    if (existing) {
      skipped++
      continue
    }

    // 3,000P 지급
    const { error: insertError } = await supabase.from('point_transactions').insert({
      user_id: profile.id,
      amount: 3000,
      type: 'earn',
      description: birthdayDescription,
    })

    if (insertError) {
      console.error('[BIRTHDAY_CRON] Point insert failed:', profile.id, insertError)
    } else {
      awarded++
      console.log(`✅ [BIRTHDAY_CRON] 3000P awarded to ${profile.id} (${profile.display_name || 'unknown'})`)
    }
  }

  return NextResponse.json({
    success: true,
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    total: (profiles || []).length,
    awarded,
    skipped,
  })
}
