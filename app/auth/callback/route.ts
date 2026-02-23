import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/shared/lib/supabase/admin'

/**
 * 인증 콜백 라우트
 *
 * ⚠️ 핵심 수정: Route Handler에서 NextResponse.redirect()를 반환할 때
 * cookies().set()으로 설정한 쿠키가 redirect response에 포함되지 않는 Next.js 이슈.
 * createServerClient를 직접 사용하고 쿠키를 response에 명시적으로 설정.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectParam = requestUrl.searchParams.get('redirect') || '/account'
  const origin = requestUrl.origin

  // OAuth 흐름: code가 있으면 세션으로 교환
  if (code) {
    // redirect response에 직접 설정하기 위해 쿠키를 수집
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookies) {
            // redirect response에 수동으로 설정하기 위해 수집
            cookies.forEach((c) => cookiesToSet.push(c as typeof cookiesToSet[0]))
          },
        },
      }
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error || !data.user) {
        return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // 신규 회원가입 보너스: point_transactions가 없으면 3,000P 지급
      try {
        const adminClient = createAdminClient()
        const { count } = await adminClient
          .from('point_transactions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', data.user.id)
        if (count === 0) {
          await adminClient.from('point_transactions').insert({
            user_id: data.user.id,
            amount: 3000,
            type: 'earn',
            description: '신규 회원가입 혜택',
          })
        }
      } catch {
        // 포인트 지급 실패해도 로그인은 계속 진행
      }

      const defaultRedirect = profile?.role === 'admin' ? '/admin/orders' : '/account'
      const response = NextResponse.redirect(`${origin}${redirectParam || defaultRedirect}`)

      // ✅ 세션 쿠키를 redirect response에 명시적으로 설정 (핵심 수정)
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      })

      return response
    } catch {
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected`)
    }
  }

  // code가 없는 경우: 기존 세션 확인
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // 읽기 전용 - 쿠키 설정 불필요
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.redirect(`${origin}/auth/login?error=no_session`)
    }

    return NextResponse.redirect(`${origin}${redirectParam}`)
  } catch {
    return NextResponse.redirect(`${origin}/auth/login?error=unexpected`)
  }
}
