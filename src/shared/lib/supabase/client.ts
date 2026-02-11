import { createBrowserClient } from '@supabase/ssr'

/**
 * 브라우저용 Supabase 클라이언트
 * createBrowserClient는 자동으로 브라우저 쿠키를 관리합니다
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase 환경 변수가 설정되지 않았습니다.\n' +
      'NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 .env.local에 설정하세요.'
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

  // Supabase 공식 방식: createBrowserClient는 기본적으로 브라우저 쿠키를 자동 관리
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

