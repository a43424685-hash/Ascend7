import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { CookieOptionsWithName } from '@supabase/ssr'

/**
 * POST /api/auth/login
 * 
 * Route Handler로 로그인 처리
 * 쿠키를 누적한 뒤 최종 응답 객체에 설정하여 반환
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

    // 쿠키를 누적할 배열
    const pendingCookies: CookieOptionsWithName[] = []

    // Supabase 클라이언트 생성 - setAll에서 쿠키를 배열에 누적만 함
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: CookieOptionsWithName[]) {
            // 쿠키를 배열에 누적만 함 (아직 응답 객체에 설정하지 않음)
            pendingCookies.push(...cookiesToSet)
            
            console.log('🍪 [LOGIN ROUTE] Accumulated cookies:', {
              count: cookiesToSet.length,
              names: cookiesToSet.map(c => c.name),
              totalPending: pendingCookies.length,
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

    console.log('🔄 [LOGIN ROUTE] Preparing response with redirect:', redirectTo)

    // 최종 응답 객체 생성
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

    // 누적된 쿠키를 최종 응답 객체에 설정
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    console.log('✅ [LOGIN ROUTE] Response ready with cookies:', {
      cookieCount: pendingCookies.length,
      cookieNames: pendingCookies.map(c => c.name),
    })

    // 쿠키가 포함된 최종 응답 반환
    return response
  } catch (error: any) {
    console.error('❌ [LOGIN ROUTE] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

