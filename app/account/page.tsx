import { redirect } from 'next/navigation'
import { getProfile } from './actions'
import { ProfileForm } from './profile-form'
import { PasswordForm } from './password-form'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/')
  }

  return (
    <div className="space-y-8">
      {/* 프로필 */}
      <div className="bg-white p-6 rounded-sm border border-gray-100">
        <h2 className="text-base font-bold mb-5 pb-3 border-b border-gray-100">
          프로필 정보
        </h2>
        <ProfileForm profile={profile} />
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
