/**
 * 관리자 권한 체크 유틸리티
 * 
 * Supabase Auth + profiles.role을 사용한 권한 관리
 */

import { createClient } from '@/shared/lib/supabase/server'

/**
 * 현재 사용자가 관리자인지 확인
 * @returns Promise<{ isAdmin: boolean; user: User | null }>
 */
export async function checkAdminAuth() {
  const supabase = await createClient()
  
  // 1. 사용자 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { isAdmin: false, user: null, error: 'Not authenticated' }
  }
  
  // 2. profiles에서 role 확인
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profile) {
    console.warn(`⚠️ [AUTH] Profile not found for user ${user.id}`)
    return { isAdmin: false, user, error: 'Profile not found' }
  }
  
  const isAdmin = profile.role === 'admin'
  
  console.log(`🔐 [AUTH] Admin check`, {
    userId: user.id,
    email: user.email,
    role: profile.role,
    isAdmin,
  })
  
  return { isAdmin, user, error: null }
}

/**
 * 관리자 권한 체크 (권한 없으면 throw)
 * Server Components/Server Actions에서 사용
 * 
 * @throws Error if not admin
 * @returns Promise<User>
 */
export async function requireAdmin() {
  const { isAdmin, user, error } = await checkAdminAuth()
  
  if (!isAdmin || !user) {
    const message = error || 'Admin access required'
    console.error(`❌ [AUTH] Admin access denied`, { error: message })
    throw new Error(message)
  }
  
  return user
}

/**
 * 관리자 권한 체크 (클라이언트용)
 * API Route에서 JSON 응답 리턴
 */
export async function checkAdminAuthAPI() {
  const { isAdmin, user, error } = await checkAdminAuth()
  
  return {
    isAdmin,
    user: user ? {
      id: user.id,
      email: user.email,
    } : null,
    error,
  }
}

