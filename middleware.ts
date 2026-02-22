import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/shared/lib/supabase/middleware'

/**
 * Next.js Middleware - Supabase Auth 세션 관리 (공식 SSR 패턴)
 * 
 * 주요 기능:
 * 1. updateSession으로 모든 요청에서 세션 자동 갱신
 * 2. /admin/* 경로 보호 (admin role 확인)
 * 3. /account/* 경로 보호 (로그인 필요)
 * 4. 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Supabase 공식 패턴: updateSession으로 세션 갱신 및 쿠키 동기화
  // /api/auth/* 만 bypass (Route Handler가 직접 쿠키 설정)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const { supabaseResponse, supabase, user, error: authError } = await updateSession(request)

  // /auth/* 경로는 리다이렉트 없이 그대로 통과 (단, updateSession은 실행해서 쿠키 동기화)
  if (pathname.startsWith('/auth')) {
    return supabaseResponse
  }

  // 디버그 로그 (프로덕션에서 세션 문제 추적용)
  if (process.env.NODE_ENV === 'production') {
    const allCookies = request.cookies.getAll()
    const cookieNames = allCookies.map(c => c.name)
    const supabaseCookies = allCookies.filter(c => 
      c.name.startsWith('sb-') || c.name.includes('supabase')
    )
    
    console.log('🔍 [MIDDLEWARE DEBUG]', {
      pathname,
      hasUser: !!user,
      userId: user?.id?.substring(0, 8) + '...',
      userEmail: user?.email,
      authError: authError?.message,
      cookiesCount: cookieNames.length,
      supabaseCookiesCount: supabaseCookies.length,
      allCookieNames: cookieNames.length > 0 ? cookieNames : 'NO_COOKIES',
      supabaseCookieNames: supabaseCookies.map(c => c.name),
      timestamp: new Date().toISOString(),
    })
  }

  // 2. /admin/* 경로 보호 (admin role 필요)
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

  // 3. /account/* 경로 보호 (로그인 필요)
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

  // 4. updateSession에서 반환된 response 리턴 (세션 쿠키 포함!)
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

