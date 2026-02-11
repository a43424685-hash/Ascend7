/**
 * 관리자 권한 체크 유틸리티
 */

import { createClient } from '@/shared/lib/supabase/server'

/**
 * 현재 사용자가 관리자인지 확인
 */
export async function checkAdminAuth() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { isAdmin: false, user: null, error: 'Not authenticated' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { isAdmin: false, user, error: 'Profile not found' }
  }

  const isAdmin = profile.role === 'admin'

  return { isAdmin, user, error: null }
}

/**
 * 관리자 권한 체크 (권한 없으면 throw)
 */
export async function requireAdmin() {
  const { isAdmin, user, error } = await checkAdminAuth()

  if (!isAdmin || !user) {
    throw new Error(error || 'Admin access required')
  }

  return user
}

/**
 * 관리자 권한 체크 (API용)
 */
export async function checkAdminAuthAPI() {
  const { isAdmin, user, error } = await checkAdminAuth()

  return {
    isAdmin,
    user: user
      ? {
          id: user.id,
          email: user.email,
        }
      : null,
    error,
  }
}
