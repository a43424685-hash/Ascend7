import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { CookieOptionsWithName } from '@supabase/ssr'

/**
 * 쿠키를 Set-Cookie 헤더 문자열로 직렬화
 */
function serializeCookie(name: string, value: string, options?: any): string {
  let cookie = `${name}=${value}`
  
  if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`
  if (options?.expires) cookie += `; Expires=${options.expires.toUTCString()}`
  if (options?.path) cookie += `; Path=${options.path}`
  if (options?.domain) cookie += `; Domain=${options.domain}`
  if (options?.httpOnly) cookie += '; HttpOnly'
  if (options?.secure) cookie += '; Secure'
  if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`
  
  return cookie
}

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
            // ⚠️ 중요: 빈 배열 반환하여 Supabase가 항상 새 세션 생성하도록 강제
            // 기존 쿠키가 있으면 Supabase가 새 쿠키를 생성하지 않는 문제 해결
            console.log('🍪 [LOGIN ROUTE] getAll() called - returning empty array to force new session')
            return []
          },
          setAll(cookiesToSet: CookieOptionsWithName[]) {
            // ⚠️ 이 함수가 호출되는지 확인하는 로그
            console.log('🍪 [LOGIN ROUTE] setAll CALLED!', {
              count: cookiesToSet.length,
              names: cookiesToSet.map(c => c.name),
            })
            
            // 쿠키를 배열에 누적만 함 (아직 응답 객체에 설정하지 않음)
            pendingCookies.push(...cookiesToSet)
            
            console.log('🍪 [LOGIN ROUTE] Accumulated cookies:', {
              totalPending: pendingCookies.length,
              allNames: pendingCookies.map(c => c.name),
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
      pendingCookiesAfterLogin: pendingCookies.length,
    })

    // ⚠️ 중요: signInWithPassword의 세션 데이터를 직접 쿠키로 변환
    // Supabase의 setAll()을 우회하고 수동으로 쿠키 생성
    if (data.session) {
      const sessionData = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type,
        user: data.session.user,
      }

      // Supabase 쿠키 형식: JSON 문자열 (response.cookies.set이 자동으로 인코딩)
      const sessionString = JSON.stringify(sessionData)

      // Supabase 쿠키 이름 형식 (프로젝트 ID 추출)
      const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
      const cookieName = `sb-${projectId}-auth-token`
      
      console.log('🍪 [LOGIN ROUTE] Manually creating session cookie:', {
        cookieName,
        projectId,
        hasAccessToken: !!data.session.access_token,
        hasRefreshToken: !!data.session.refresh_token,
        valueLength: sessionString.length,
      })

      // 수동으로 쿠키 추가
      pendingCookies.push({
        name: cookieName,
        value: sessionString,
        options: {
          path: '/',
          httpOnly: false, // Supabase client는 httpOnly: false 사용
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: data.session.expires_in || 3600,
        },
      })

      console.log('✅ [LOGIN ROUTE] Session cookie added to pending:', {
        pendingCookiesCount: pendingCookies.length,
        cookieNames: pendingCookies.map(c => c.name),
      })
    }

    // profiles에서 role 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const redirectTo = profile?.role === 'admin' ? '/admin/orders' : '/account'

    console.log('🔄 [LOGIN ROUTE] Preparing response with redirect:', redirectTo)
    console.log('🔄 [LOGIN ROUTE] Pending cookies before creating response:', {
      count: pendingCookies.length,
      names: pendingCookies.map(c => c.name),
    })

    // ⚠️ setAll이 호출되지 않았다면 경고
    if (pendingCookies.length === 0) {
      console.error('⚠️ [LOGIN ROUTE] WARNING: No cookies were set by Supabase! setAll was never called!')
    }

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

    console.log('📦 [LOGIN ROUTE] Response object created')

    // 누적된 쿠키를 최종 응답 객체에 설정
    console.log('🍪 [LOGIN ROUTE] Setting cookies on response...')
    pendingCookies.forEach(({ name, value, options }, index) => {
      console.log(`🍪 [LOGIN ROUTE] Setting cookie ${index + 1}/${pendingCookies.length}:`, {
        name,
        valueLength: value?.length || 0,
        hasOptions: !!options,
        path: options?.path,
        httpOnly: options?.httpOnly,
        sameSite: options?.sameSite,
      })
      response.cookies.set(name, value, options)
    })

    // 쿠키 설정 후 실제로 헤더에 포함되었는지 확인
    const responseCookies = response.cookies.getAll()
    console.log('🍪 [LOGIN ROUTE] Response cookies after set:', {
      count: responseCookies.length,
      names: responseCookies.map(c => c.name),
    })

    // Set-Cookie 헤더 직접 확인
    const setCookieHeader = response.headers.get('set-cookie')
    console.log('🔍 [LOGIN ROUTE] Set-Cookie header:', {
      exists: !!setCookieHeader,
      value: setCookieHeader ? 'EXISTS' : 'NULL',
    })

    // 만약 response.cookies.set()이 작동하지 않으면, 수동으로 헤더 설정 시도
    if (!setCookieHeader && pendingCookies.length > 0) {
      console.warn('⚠️ [LOGIN ROUTE] response.cookies.set() did not work! Trying manual header append...')
      
      pendingCookies.forEach(({ name, value, options }) => {
        const cookieString = serializeCookie(name, value, options)
        response.headers.append('Set-Cookie', cookieString)
        console.log('📝 [LOGIN ROUTE] Manually appended cookie:', { name, cookieString: cookieString.substring(0, 100) })
      })
    }

    console.log('✅ [LOGIN ROUTE] Response ready, returning...')

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

