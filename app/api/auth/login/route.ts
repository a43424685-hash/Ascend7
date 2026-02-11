import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { CookieOptionsWithName } from '@supabase/ssr'

/**
 * POST /api/auth/login
 * 
 * Route Handler로 로그인 처리
 * Server Action과 달리 NextResponse에 명시적으로 set-cookie를 설정할 수 있음
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

    const cookieStore = await cookies()
    
    // NextResponse 생성 (쿠키를 담을 response 객체)
    const response = NextResponse.json({ success: true })

    // Supabase 클라이언트 생성 - response.cookies에 직접 설정
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: CookieOptionsWithName[]) {
            // response.cookies에 직접 설정 - set-cookie 헤더에 포함됨
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
            
            console.log('🍪 [LOGIN ROUTE] Set cookies in response:', {
              count: cookiesToSet.length,
              names: cookiesToSet.map(c => c.name),
            })
          },
        },
      }
    )

    // 로그인 실행
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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

    // profiles에서 role 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const redirectTo = profile?.role === 'admin' ? '/admin/orders' : '/account'

    console.log('🔄 [LOGIN ROUTE] Returning success with redirect:', redirectTo)

    // 성공 응답 (쿠키는 이미 response.cookies.set으로 설정됨)
    return NextResponse.json(
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
        headers: response.headers, // 쿠키 헤더 포함
      }
    )
  } catch (error: any) {
    console.error('❌ [LOGIN ROUTE] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

