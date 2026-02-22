'use server'

import { getSupabaseClient } from '@/shared/api/supabaseClient'

export async function getAuthUserEmail(): Promise<string | null> {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.email ?? null
}
