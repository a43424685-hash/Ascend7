import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/login
 * 
 * Supabase SSR 공식 패턴: get/set/remove 메서드 사용
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

    // 쿠키 저장소 (pending cookies)
    const cookieStore: Record<string, { value: string; options: CookieOptions }> = {}

    // Supabase 클라이언트 생성 - get/set/remove 패턴
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // 먼저 pending에서 확인, 없으면 request에서
            const pending = cookieStore[name]
            if (pending) {
              console.log('🍪 [LOGIN ROUTE] get() from pending:', name)
              return pending.value
            }
            const value = request.cookies.get(name)?.value
            console.log('🍪 [LOGIN ROUTE] get() from request:', { name, hasValue: !!value })
            return value
          },
          set(name: string, value: string, options: CookieOptions) {
            console.log('🍪 [LOGIN ROUTE] set() CALLED!', { 
              name, 
              valueLength: value.length,
              options: { path: options.path, httpOnly: options.httpOnly, sameSite: options.sameSite }
            })
            // pending 저장소에 누적
            cookieStore[name] = { value, options }
          },
          remove(name: string, options: CookieOptions) {
            console.log('🍪 [LOGIN ROUTE] remove() called:', name)
            cookieStore[name] = { value: '', options: { ...options, maxAge: 0 } }
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

    // ⚠️ 핵심: setSession()을 호출하여 Supabase가 set() 메서드를 통해 쿠키를 저장하도록 함
    console.log('🔐 [LOGIN ROUTE] Calling setSession() to trigger cookie storage...')
    
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

    console.log('✅ [LOGIN ROUTE] setSession completed')
    console.log('🍪 [LOGIN ROUTE] Pending cookies in store:', {
      count: Object.keys(cookieStore).length,
      names: Object.keys(cookieStore),
    })

    // profiles에서 role 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const redirectTo = profile?.role === 'admin' ? '/admin/orders' : '/account'

    console.log('🔄 [LOGIN ROUTE] Creating final response with redirect:', redirectTo)

    // 최종 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'user',
        },
        redirectTo,
      },
      { status: 200 }
    )

    // ⚠️ 핵심: pending cookies를 response에 설정
    console.log('🍪 [LOGIN ROUTE] Setting pending cookies to response...')
    Object.entries(cookieStore).forEach(([name, { value, options }]) => {
      console.log(`🍪 [LOGIN ROUTE] Setting cookie: ${name} (${value.length} chars)`)
      response.cookies.set(name, value, options)
    })

    // 최종 확인
    const finalCookies = response.cookies.getAll()
    console.log('✅ [LOGIN ROUTE] Final response cookies:', {
      count: finalCookies.length,
      names: finalCookies.map(c => c.name),
    })

    if (finalCookies.length === 0) {
      console.error('⚠️ [LOGIN ROUTE] WARNING: No cookies in final response!')
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

