'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * 로그인 Server Action
 * Server Action을 사용하면 Next.js가 자동으로 쿠키를 관리합니다.
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

    console.log('🔐 [LOGIN ACTION] Attempting login for:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ [LOGIN ACTION] Auth error:', error.message)
      return {
        error: error.message,
      }
    }

    if (!data.user) {
      console.error('❌ [LOGIN ACTION] No user')
      return {
        error: '로그인에 실패했습니다.',
      }
    }

    console.log('✅ [LOGIN ACTION] Login successful:', {
      userId: data.user.id,
      email: data.user.email,
    })

    // profiles에서 role 확인 (admin만 관리자 페이지로)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    redirectTo = profile?.role === 'admin' ? '/admin/orders' : '/'

    console.log('🔄 [LOGIN ACTION] Redirecting to:', redirectTo)

    // 캐시 무효화
    revalidatePath('/', 'layout')
    revalidatePath(redirectTo)
  } catch (error: any) {
    console.error('❌ [LOGIN ACTION] Unexpected error:', error)
    return {
      error: error.message || '로그인 중 오류가 발생했습니다.',
    }
  }

  // ⚠️ 중요: redirect()는 try/catch 밖에서 호출
  // redirect()는 NEXT_REDIRECT 에러를 throw하므로 catch하면 안됨
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

