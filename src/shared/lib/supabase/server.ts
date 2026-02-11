import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.')
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.')
  }

  const trimmedUrl = supabaseUrl.trim()

  if (!trimmedUrl.startsWith('https://') || !trimmedUrl.includes('.supabase.co')) {
    throw new Error(
      `Supabase URL 형식이 올바르지 않습니다. 현재: ${trimmedUrl}`
    )
  }

  const cleanUrl = trimmedUrl.replace(/\/$/, '')
  const cookieStore = await cookies()

  return createServerClient(cleanUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(
          ({ name, value, options }: { name: string; value: string; options: any }) => {
            cookieStore.set(name, value, options)
          }
        )
      },
    },
  })
}
