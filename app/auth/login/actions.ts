'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'

/**
 * 로그인 Server Action
 * 
 * 서버에서 signInWithPassword를 실행하여 세션을 서버 쿠키에 저장
 * 이렇게 하면 middleware가 즉시 세션을 인식할 수 있음
 */
export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      error: '이메일과 비밀번호를 입력하세요.',
    }
  }

  try {
    const supabase = await createClient()

    // 서버에서 로그인 실행 - 서버 쿠키에 세션 저장
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ [LOGIN ACTION] Auth error', {
        error: error.message,
        email,
      })
      return {
        error: error.message,
      }
    }

    if (!data.user) {
      return {
        error: '로그인 실패: 사용자 정보를 찾을 수 없습니다.',
      }
    }

    console.log('✅ [LOGIN ACTION] Login successful', {
      userId: data.user.id,
      email: data.user.email,
    })

    // profiles에서 role 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    // role에 따라 리다이렉트
    if (profile?.role === 'admin') {
      redirect('/admin/orders')
    } else {
      redirect('/account')
    }
  } catch (error: any) {
    console.error('❌ [LOGIN ACTION] Unexpected error', {
      error: error.message,
    })
    return {
      error: error.message || '로그인 중 오류가 발생했습니다.',
    }
  }
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

