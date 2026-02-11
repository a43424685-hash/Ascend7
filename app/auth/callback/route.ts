import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'

/**
 * 인증 콜백 라우트
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/account'
  const origin = requestUrl.origin

  const supabase = await createClient()

  // OAuth 흐름: code가 있으면 세션으로 교환
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error || !data.user) {
        return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const defaultRedirect =
        profile?.role === 'admin' ? '/admin/orders' : '/account'
      return NextResponse.redirect(`${origin}${redirect || defaultRedirect}`)
    } catch (err) {
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected`)
    }
  }

  // 이메일/비밀번호 로그인 후 세션 확인
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.redirect(`${origin}/auth/login?error=no_session`)
    }

    return NextResponse.redirect(`${origin}${redirect}`)
  } catch (err) {
    return NextResponse.redirect(`${origin}/auth/login?error=unexpected`)
  }
}
