import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase SSR 공식 패턴: updateSession
 * 
 * Middleware에서 세션을 갱신하고 쿠키를 브라우저에 전달하는 함수
 * 모든 요청에 대해 세션을 자동으로 갱신하여 만료를 방지합니다
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieOptionsWithName[]) {
          // 1. request 쿠키 업데이트 (middleware 내부용)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          
          // 2. response 재생성 (업데이트된 request 반영)
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // 3. response 쿠키 설정 (브라우저로 전달)
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: getUser()를 호출하여 세션을 갱신하고 쿠키를 업데이트
  // 이 호출이 없으면 setAll이 실행되지 않아 쿠키가 갱신되지 않음
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return {
    supabaseResponse,
    supabase,
    user,
    error,
  }
}

