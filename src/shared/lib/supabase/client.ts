import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
    )
  }

  // URL 형식 검증
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error(
      `잘못된 Supabase URL 형식입니다.\n` +
      `올바른 형식: https://[프로젝트ID].supabase.co\n` +
      `현재 URL: ${supabaseUrl}`
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

