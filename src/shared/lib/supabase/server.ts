import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptionsWithName } from "@supabase/ssr";

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 환경 변수 확인 및 상세한 에러 메시지
  if (!supabaseUrl) {
    throw new Error(
      '❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.\n\n' +
      '📋 해결 방법:\n' +
      '1. 프로젝트 루트에 .env.local 파일 생성\n' +
      '2. NEXT_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co 추가\n' +
      '3. Supabase 대시보드 → Settings → API → Project URL에서 복사\n' +
      '4. 개발 서버 재시작 (npm run dev)'
    )
  }

  if (!supabaseKey) {
    throw new Error(
      '❌ NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.\n\n' +
      '📋 해결 방법:\n' +
      '1. .env.local 파일에 NEXT_PUBLIC_SUPABASE_ANON_KEY 추가\n' +
      '2. Supabase 대시보드 → Settings → API → anon public 키 복사\n' +
      '3. 개발 서버 재시작 (npm run dev)'
    )
  }

  // URL 형식 검증 (더 엄격하게)
  const trimmedUrl = supabaseUrl.trim()
  
  if (!trimmedUrl.startsWith('https://')) {
    throw new Error(
      `❌ Supabase URL이 https://로 시작하지 않습니다.\n\n` +
      `현재 URL: ${trimmedUrl}\n` +
      `올바른 형식: https://[프로젝트ID].supabase.co\n\n` +
      `Supabase 대시보드 → Settings → API → Project URL에서 확인하세요.`
    )
  }

  if (!trimmedUrl.includes('.supabase.co')) {
    throw new Error(
      `❌ Supabase URL 형식이 올바르지 않습니다.\n\n` +
      `현재 URL: ${trimmedUrl}\n` +
      `올바른 형식: https://[프로젝트ID].supabase.co\n\n` +
      `주의: 대시보드 URL (app.supabase.com)이 아닌 API URL이어야 합니다.`
    )
  }

  // 끝에 슬래시 제거
  const cleanUrl = trimmedUrl.replace(/\/$/, '')

  if (cleanUrl !== trimmedUrl) {
    console.warn(
      `⚠️ Supabase URL 끝의 슬래시를 제거했습니다: ${trimmedUrl} → ${cleanUrl}`
    )
  }

  const cookieStore = await cookies()

  try {
    return createServerClient(cleanUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieOptionsWithName[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
  } catch (err: any) {
    throw new Error(
      `❌ Supabase 클라이언트 생성 실패\n\n` +
      `원인: ${err.message || String(err)}\n\n` +
      `확인 사항:\n` +
      `1. URL 형식: ${cleanUrl}\n` +
      `2. Anon Key 길이: ${supabaseKey.length}자\n` +
      `3. .env.local 파일이 올바른지 확인\n` +
      `4. 개발 서버 재시작`
    )
  }
}

