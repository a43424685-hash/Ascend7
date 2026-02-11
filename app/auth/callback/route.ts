import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'

/**
 * OAuth 콜백 라우트
 * 
 * Supabase OAuth 흐름:
 * 1. 사용자가 signInWithOAuth 호출 → OAuth 제공자 페이지로 이동
 * 2. 인증 성공 시 이 라우트로 리다이렉트 (with code)
 * 3. code를 세션으로 교환
 * 4. 사용자 role 확인 후 적절한 페이지로 리다이렉트
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('🔐 [AUTH CALLBACK] Request received', {
    hasCode: !!code,
    origin,
  })

  if (code) {
    try {
      const supabase = await createClient()

      // code를 세션으로 교환
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

      console.log('✅ [AUTH CALLBACK] User authenticated', {
        userId: data.user.id,
        email: data.user.email,
      })

      // profiles 테이블에서 role 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.warn('⚠️ [AUTH CALLBACK] Profile not found', {
          userId: data.user.id,
          error: profileError.message,
        })
        // profile이 없어도 일단 홈으로 보냄
        return NextResponse.redirect(`${origin}/`)
      }

      // role에 따라 리다이렉트
      if (profile.role === 'admin') {
        console.log('👑 [AUTH CALLBACK] Admin user, redirecting to /admin/orders', {
          userId: data.user.id,
          email: data.user.email,
        })
        return NextResponse.redirect(`${origin}/admin/orders`)
      } else {
        console.log('👤 [AUTH CALLBACK] Regular user, redirecting to /', {
          userId: data.user.id,
          email: data.user.email,
          role: profile.role,
        })
        return NextResponse.redirect(`${origin}/`)
      }
    } catch (err: any) {
      console.error('❌ [AUTH CALLBACK] Unexpected error', {
        error: err.message,
      })
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected`)
    }
  }

  // code가 없으면 에러
  console.error('❌ [AUTH CALLBACK] No code parameter')
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}

