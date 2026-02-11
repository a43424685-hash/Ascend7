import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'

/**
 * 인증 콜백 라우트 (통합)
 * 
 * 2가지 시나리오를 처리:
 * 1. OAuth 흐름: code 파라미터가 있으면 exchangeCodeForSession
 * 2. 이메일/비밀번호 로그인 후: 서버에서 세션 확정
 * 
 * 핵심: 서버에서 세션을 확인하고 쿠키에 저장하여 middleware가 인식하도록 함
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/account'
  const origin = requestUrl.origin

  console.log('🔐 [AUTH CALLBACK] Request received', {
    hasCode: !!code,
    redirect,
    origin,
  })

  const supabase = await createClient()

  // 시나리오 1: code가 있으면 OAuth 흐름 (카카오 로그인 등)
  if (code) {
    try {
      // code를 세션으로 교환 (서버 쿠키에 저장)
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ [AUTH CALLBACK] Code exchange failed', {
          error: error.message,
        })
        return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
      }

      if (!data.user) {
        console.error('❌ [AUTH CALLBACK] No user after exchange')
        return NextResponse.redirect(`${origin}/auth/login?error=no_user`)
      }

      console.log('✅ [AUTH CALLBACK] OAuth session established', {
        userId: data.user.id,
        email: data.user.email,
      })

      // profiles에서 role 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // role에 따라 리다이렉트
      const defaultRedirect = profile?.role === 'admin' ? '/admin/orders' : '/account'
      return NextResponse.redirect(`${origin}${redirect || defaultRedirect}`)
    } catch (err: any) {
      console.error('❌ [AUTH CALLBACK] OAuth error', {
        error: err.message,
      })
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected`)
    }
  }

  // 시나리오 2: code 없음 = 이메일/비밀번호 로그인 후
  // 클라이언트가 이미 세션을 가지고 있으면 서버에서 확인하고 리다이렉트
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('❌ [AUTH CALLBACK] No session found', {
        error: error?.message,
      })
      return NextResponse.redirect(`${origin}/auth/login?error=no_session`)
    }

    console.log('✅ [AUTH CALLBACK] Email/password session confirmed', {
      userId: user.id,
      email: user.email,
      redirect,
    })

    // 세션이 확인되었으므로 요청된 경로로 리다이렉트
    return NextResponse.redirect(`${origin}${redirect}`)
  } catch (err: any) {
    console.error('❌ [AUTH CALLBACK] Session check failed', {
      error: err.message,
    })
    return NextResponse.redirect(`${origin}/auth/login?error=unexpected`)
  }
}

