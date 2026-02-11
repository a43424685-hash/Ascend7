'use server'

import { createClient } from '@/shared/lib/supabase/server'

/**
 * 회원가입 Server Action
 * 
 * 참고: 로그인은 Route Handler (/api/auth/login/route.ts)를 사용합니다.
 * 로그인을 Server Action으로 처리하면 쿠키 설정이 제대로 되지 않기 때문입니다.
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
      console.error('❌ [SIGNUP ACTION] Auth error', {
        error: error.message,
        email,
      })
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
    console.error('❌ [SIGNUP ACTION] Unexpected error', {
      error: error.message,
    })
    return {
      error: error.message || '회원가입 중 오류가 발생했습니다.',
    }
  }
}

