import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Middleware - Supabase Auth 세션 관리
 * 
 * 주요 기능:
 * 1. 모든 요청에서 세션 자동 갱신
 * 2. /admin/* 경로 보호 (admin role 확인)
 * 3. /account/* 경로 보호 (로그인 필요)
 * 4. 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. response 객체 생성 (나중에 쿠키를 설정할 것)
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Supabase 클라이언트 생성 (쿠키 자동 동기화)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieOptionsWithName[]) {
          // request 쿠키 설정 (middleware 내부용)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // response 쿠키 설정 (브라우저로 전달)
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 3. 세션 갱신 (getUser 호출 시 자동으로 쿠키 갱신)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // 디버그 로그 (프로덕션에서 세션 문제 추적용)
  if (process.env.NODE_ENV === 'production') {
    const cookieNames = request.cookies.getAll().map(c => c.name)
    console.log('🔍 [MIDDLEWARE DEBUG]', {
      pathname,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
      cookiesCount: cookieNames.length,
      cookieNames: cookieNames,
      timestamp: new Date().toISOString(),
    })
  }

  // 4. /admin/* 경로 보호 (admin role 필요)
  if (pathname.startsWith('/admin')) {
    // 인증되지 않은 경우 → 로그인 페이지
    if (!user) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      console.log('🔒 [MIDDLEWARE] Unauthenticated user accessing admin', {
        pathname,
        redirectTo: redirectUrl.toString(),
      })
      return NextResponse.redirect(redirectUrl)
    }

    // profiles에서 role 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // admin이 아닌 경우 → 홈으로 리다이렉트
    if (profile?.role !== 'admin') {
      console.log('🚫 [MIDDLEWARE] Non-admin user accessing admin', {
        userId: user.id,
        email: user.email,
        role: profile?.role || 'none',
        pathname,
      })
      return NextResponse.redirect(new URL('/', request.url))
    }

    console.log('✅ [MIDDLEWARE] Admin access granted', {
      userId: user.id,
      email: user.email,
      pathname,
    })
  }

  // 5. /account/* 경로 보호 (로그인 필요)
  if (pathname.startsWith('/account')) {
    // 인증되지 않은 경우 → 로그인 페이지
    if (!user) {
      const cookieNames = request.cookies.getAll().map(c => c.name)
      const supabaseCookies = cookieNames.filter(name => 
        name.startsWith('sb-') || name.includes('supabase')
      )
      
      console.log('🔒 [MIDDLEWARE] Unauthenticated user accessing account', {
        pathname,
        authError: authError?.message,
        totalCookies: cookieNames.length,
        supabaseCookies: supabaseCookies.length > 0 ? supabaseCookies : 'NONE',
        allCookieNames: cookieNames,
        redirectTo: '/auth/login',
      })
      
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    console.log('✅ [MIDDLEWARE] Account access granted', {
      userId: user.id,
      email: user.email,
      pathname,
    })
  }

  // 6. 쿠키가 포함된 response 반환 (세션 유지의 핵심!)
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /_next/* (Next.js internals)
     * - 정적 파일 확장자 (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}

