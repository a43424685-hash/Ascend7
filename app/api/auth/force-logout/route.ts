import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * 세션 만료 강제 로그아웃
 * - middleware에서 3시간 경과 감지 시 이 라우트로 리다이렉트
 * - Supabase 세션 클리어 + session_start 쿠키 삭제
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin
  const cookiesToSet: Array<{ name: string; value: string; options: any }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach((c) => cookiesToSet.push(c))
        },
      },
    }
  )

  await supabase.auth.signOut()

  const response = NextResponse.redirect(`${origin}/auth/login?session=expired`)

  // Supabase가 설정한 쿠키 삭제(세션 클리어) 를 response에 반영
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  // session_start 쿠키 삭제
  response.cookies.delete('session_start')

  return response
}
