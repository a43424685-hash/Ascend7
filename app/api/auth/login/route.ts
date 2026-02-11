import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/login
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

    const cookieStore: Record<
      string,
      { value: string; options: CookieOptions }
    > = {}

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const pending = cookieStore[name]
            if (pending) return pending.value
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore[name] = { value, options }
          },
          remove(name: string, options: CookieOptions) {
            cookieStore[name] = { value: '', options: { ...options, maxAge: 0 } }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: '로그인 실패: 세션을 생성할 수 없습니다.' },
        { status: 401 }
      )
    }

    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    if (setSessionError) {
      return NextResponse.json(
        { error: 'Failed to set session: ' + setSessionError.message },
        { status: 500 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const redirectTo = profile?.role === 'admin' ? '/admin/orders' : '/account'

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

    // Set cookies to response
    Object.entries(cookieStore).forEach(([name, { value, options }]) => {
      const cookieOptions = {
        ...options,
        path: options.path || '/',
        httpOnly: options.httpOnly ?? false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (options.sameSite as 'lax' | 'strict' | 'none') || 'lax',
      }
      response.cookies.set(name, value, cookieOptions)
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
