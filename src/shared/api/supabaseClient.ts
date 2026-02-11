/**
 * Supabase 클라이언트 생성 유틸리티 (서버 전용)
 * 서버 컴포넌트에서만 사용 가능
 */

import { createClient as createServerClient } from '@/shared/lib/supabase/server'

/**
 * 서버 컴포넌트에서 사용하는 Supabase 클라이언트
 * ⚠️ 서버 컴포넌트에서만 사용 가능
 */
export async function getSupabaseClient() {
  return await createServerClient()
}
