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

  // try 블록에서는 실제 에러만 처리하고, redirect는 밖에서 실행
  let redirectPath: string | null = null

  try {
    console.log('🔐 [LOGIN ACTION] Creating server client...')
    const supabase = await createClient()

    console.log('🔐 [LOGIN ACTION] Attempting signInWithPassword...', { email })
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
      hasSession: !!data.session,
      sessionId: data.session?.access_token?.substring(0, 20) + '...',
    })

    // 세션이 제대로 생성되었는지 확인
    if (!data.session) {
      console.error('❌ [LOGIN ACTION] No session created!')
      return {
        error: '세션 생성 실패. 다시 시도해주세요.',
      }
    }

    // profiles에서 role 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    // role에 따라 리다이렉트 경로 설정 (try 밖에서 실행)
    redirectPath = profile?.role === 'admin' ? '/admin/orders' : '/account'
    
    console.log('🔄 [LOGIN ACTION] Redirecting to:', redirectPath)
  } catch (error: any) {
    // 실제 에러만 처리
    console.error('❌ [LOGIN ACTION] Unexpected error', {
      error: error.message,
    })
    return {
      error: error.message || '로그인 중 오류가 발생했습니다.',
    }
  }

  // redirect는 try 밖에서 실행 (NEXT_REDIRECT 에러가 catch에 잡히지 않음)
  if (redirectPath) {
    redirect(redirectPath)
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

