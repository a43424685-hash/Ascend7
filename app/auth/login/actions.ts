'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

/**
 * 로그인 Server Action
 */
export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      error: '이메일과 비밀번호를 입력하세요.',
    }
  }

  let redirectTo = '/'

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        error: error.message,
      }
    }

    if (!data.user) {
      return {
        error: '로그인에 실패했습니다.',
      }
    }

    // profiles에서 role 확인 (admin만 관리자 페이지로)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    redirectTo = profile?.role === 'admin' ? '/admin/orders' : '/'

    revalidatePath('/', 'layout')
    revalidatePath(redirectTo)
  } catch (error: any) {
    return {
      error: error.message || '로그인 중 오류가 발생했습니다.',
    }
  }

  // 세션 시작 시간 기록 (3시간 만료 추적용)
  const cookieStore = await cookies()
  cookieStore.set('session_start', Date.now().toString(), {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, // 7일 (실제 만료는 middleware에서 3시간 체크)
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  redirect(redirectTo)
}

/**
 * 회원가입 Server Action
 */
export async function signUpAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      error: '이메일과 비밀번호를 입력하세요.',
    }
  }

  if (password.length < 6) {
    return {
      error: '비밀번호는 최소 6자 이상이어야 합니다.',
    }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      return {
        error: error.message,
      }
    }

    if (data.user?.identities?.length === 0) {
      return {
        error: '이미 가입된 이메일입니다.',
      }
    }

    return {
      success: true,
      message: '회원가입 완료! 이메일을 확인해주세요.',
    }
  } catch (error: any) {
    return {
      error: error.message || '회원가입 중 오류가 발생했습니다.',
    }
  }
}
