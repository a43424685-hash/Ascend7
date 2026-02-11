import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
    )
  }

  // URL 형식 검증
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error(
      `잘못된 Supabase URL 형식입니다.\n` +
      `올바른 형식: https://[프로젝트ID].supabase.co\n` +
      `현재 URL: ${supabaseUrl}`
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        // 브라우저의 document.cookie에서 쿠키 읽기
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift()
        }
      },
      set(name: string, value: string, options: any) {
        // 브라우저의 document.cookie에 쿠키 쓰기
        let cookieString = `${name}=${value}`
        
        if (options?.maxAge) {
          cookieString += `; max-age=${options.maxAge}`
        }
        if (options?.path) {
          cookieString += `; path=${options.path}`
        } else {
          cookieString += `; path=/`
        }
        if (options?.domain) {
          cookieString += `; domain=${options.domain}`
        }
        if (options?.sameSite) {
          cookieString += `; samesite=${options.sameSite}`
        }
        if (options?.secure) {
          cookieString += `; secure`
        }
        
        document.cookie = cookieString
      },
      remove(name: string, options: any) {
        // 쿠키 삭제 (maxAge=0 설정)
        this.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}

