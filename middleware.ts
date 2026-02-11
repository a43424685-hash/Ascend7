import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Middleware - Supabase Auth 세션 관리
 * 
 * 주요 기능:
 * 1. 모든 요청에서 세션 자동 갱신
 * 2. /admin/* 경로 보호 (admin role 확인)
 * 3. 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 갱신 (자동)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // /admin/* 경로 보호
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

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

