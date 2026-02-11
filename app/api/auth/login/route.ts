import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { CookieOptionsWithName } from '@supabase/ssr'

/**
 * POST /api/auth/login
 * 
 * Supabase SSR 공식 패턴으로 로그인 처리:
 * 1. Response 객체를 먼저 생성
 * 2. createServerClient의 setAll에서 response에 직접 쿠키 설정
 * 3. setSession()으로 Supabase가 쿠키를 올바른 형식으로 저장하도록 함
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력하세요.' },
        { status: 400 }
      )
    }

    console.log('🔐 [LOGIN ROUTE] Attempting login for:', email)

    // ⚠️ 핵심: Response 객체를 먼저 생성 (Supabase SSR 공식 패턴)
    let response = NextResponse.json({ success: true })

    // Supabase 클라이언트 생성 - response 객체에 직접 쿠키 설정
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // request의 쿠키를 읽음
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: CookieOptionsWithName[]) {
            console.log('🍪 [LOGIN ROUTE] setAll CALLED!', {
              count: cookiesToSet.length,
              names: cookiesToSet.map(c => c.name),
            })
            
            // ⚠️ 핵심: response 객체에 직접 쿠키 설정
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // 로그인 실행
    console.log('🔐 [LOGIN ROUTE] Calling signInWithPassword...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('🔐 [LOGIN ROUTE] signInWithPassword completed:', {
      hasError: !!error,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      sessionAccessToken: data?.session?.access_token?.substring(0, 20) + '...',
    })

    if (error) {
      console.error('❌ [LOGIN ROUTE] Auth error:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      console.error('❌ [LOGIN ROUTE] No user or session')
      return NextResponse.json(
        { error: '로그인 실패: 세션을 생성할 수 없습니다.' },
        { status: 401 }
      )
    }

    console.log('✅ [LOGIN ROUTE] Login successful:', {
      userId: data.user.id,
      email: data.user.email,
      hasSession: !!data.session,
    })

    // ⚠️ 핵심: setSession()을 호출하여 Supabase가 쿠키를 response에 설정하도록 함
    console.log('🔐 [LOGIN ROUTE] Calling setSession() to set cookies in response...')
    
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    if (setSessionError) {
      console.error('❌ [LOGIN ROUTE] setSession error:', setSessionError.message)
      return NextResponse.json(
        { error: 'Failed to set session: ' + setSessionError.message },
        { status: 500 }
      )
    }

    console.log('✅ [LOGIN ROUTE] setSession completed successfully')

    // profiles에서 role 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const redirectTo = profile?.role === 'admin' ? '/admin/orders' : '/account'

    console.log('🔄 [LOGIN ROUTE] Preparing final response with redirect:', redirectTo)

    // ⚠️ 핵심: response 객체 업데이트 (쿠키는 이미 setAll에서 response에 설정됨)
    // Headers를 복사하여 새 response 생성
    response = NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'user',
        },
        redirectTo,
      },
      { 
        status: 200,
        headers: response.headers, // 기존 헤더(쿠키 포함) 유지
      }
    )

    // 설정된 쿠키 확인
    const responseCookies = response.cookies.getAll()
    console.log('✅ [LOGIN ROUTE] Final response cookies:', {
      count: responseCookies.length,
      names: responseCookies.map(c => c.name),
    })

    if (responseCookies.length === 0) {
      console.error('⚠️ [LOGIN ROUTE] WARNING: No cookies in response! Check if setAll was called.')
    }

    return response
  } catch (error: any) {
    console.error('❌ [LOGIN ROUTE] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

