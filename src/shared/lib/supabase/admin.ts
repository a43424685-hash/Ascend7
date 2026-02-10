import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase 클라이언트
 * 서버 사이드 전용, RLS를 우회할 수 있음
 * Webhook 등에서 사용
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.\n' +
      '.env.local 파일에 SUPABASE_SERVICE_ROLE_KEY를 추가하세요.\n' +
      'Supabase 대시보드 → Settings → API → service_role key'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
