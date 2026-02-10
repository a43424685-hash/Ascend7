/**
 * Supabase 클라이언트 생성 유틸리티 (서버 전용)
 * 서버 컴포넌트에서만 사용 가능
 */

import { createClient as createServerClient } from '@/shared/lib/supabase/server'

/**
 * 환경 변수 확인 및 로깅 (서버 전용)
 */
export function checkSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const config = {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    url: supabaseUrl || '❌ 설정되지 않음',
    urlValid: supabaseUrl?.startsWith('https://') && supabaseUrl?.includes('.supabase.co'),
    keyLength: supabaseKey?.length || 0,
  }

  // 서버 사이드에서만 로깅
  if (typeof window === 'undefined') {
    console.log('🔍 Supabase 환경 변수 확인:')
    console.log('  - URL 설정:', config.hasUrl ? '✅' : '❌', config.url)
    console.log('  - URL 형식:', config.urlValid ? '✅ 올바름' : '❌ 잘못됨')
    console.log('  - Anon Key 설정:', config.hasKey ? '✅' : '❌')
    console.log('  - Anon Key 길이:', config.keyLength, '자')
  }

  return config
}

/**
 * 서버 컴포넌트에서 사용하는 Supabase 클라이언트
 * ⚠️ 서버 컴포넌트에서만 사용 가능
 */
export async function getSupabaseClient() {
  checkSupabaseConfig()
  return await createServerClient()
}

