import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { ProfileForm } from './profile-form'
import { PasswordForm } from './password-form'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, phone, email, default_address, default_address_detail, default_postal_code, default_memo')
    .eq('id', user.id)
    .single()

  const profileData = {
    display_name: profile?.display_name || null,
    phone: profile?.phone || null,
    email: profile?.email || user.email || '',
    default_address: profile?.default_address || null,
    default_address_detail: profile?.default_address_detail || null,
    default_postal_code: profile?.default_postal_code || null,
    default_memo: profile?.default_memo || null,
  }

  return (
    <div className="space-y-8">
      {/* 프로필 */}
      <div className="bg-white p-6 rounded-sm border border-gray-100">
        <h2 className="text-base font-bold mb-5 pb-3 border-b border-gray-100">
          프로필 정보
        </h2>
        <ProfileForm profile={profileData} />
      </div>

      {/* 비밀번호 */}
      <div className="bg-white p-6 rounded-sm border border-gray-100">
        <h2 className="text-base font-bold mb-5 pb-3 border-b border-gray-100">
          비밀번호 변경
        </h2>
        <PasswordForm />
      </div>
    </div>
  )
}
