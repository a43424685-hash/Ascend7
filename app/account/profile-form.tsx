'use client'

import { useFormState } from 'react-dom'
import { Button } from '@/shared/ui/button'
import { updateProfile, type ProfileData } from './actions'

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const [state, formAction] = useFormState(updateProfile, undefined)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border-2 border-red-200 p-3 rounded">
          <p className="text-red-800 text-sm">{state.error}</p>
        </div>
      )}
      {state?.success && (
        <div className="bg-green-50 border-2 border-green-200 p-3 rounded">
          <p className="text-green-800 text-sm">프로필이 업데이트되었습니다.</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={profile.email}
          disabled
          className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
      </div>

      <div>
        <label htmlFor="display_name" className="block text-sm font-semibold text-gray-700 mb-1">
          이름 (Display Name)
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile.display_name || ''}
          placeholder="홍길동"
          className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
          전화번호
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone || ''}
          placeholder="010-1234-5678"
          className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        />
      </div>

      <Button type="submit" className="w-full">
        프로필 저장
      </Button>
    </form>
  )
}
