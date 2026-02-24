'use client'

import { useState, useCallback } from 'react'
import { useFormState } from 'react-dom'
import { Button } from '@/shared/ui/button'
import { AddressSearch } from '@/shared/ui/address-search'
import { updateProfile, type ProfileData } from './actions'

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const [state, formAction] = useFormState(updateProfile, undefined)

  // 주소 필드만 controlled state (주소검색 연동)
  const [postalCode, setPostalCode] = useState(profile.default_postal_code || '')
  const [address, setAddress] = useState(profile.default_address || '')

  const handleAddressComplete = useCallback(
    (result: { postalCode: string; address: string }) => {
      setPostalCode(result.postalCode)
      setAddress(result.address)
    },
    []
  )

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
          이름
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

      <div>
        <label htmlFor="birthday" className="block text-sm font-semibold text-gray-700 mb-1">
          생년월일
        </label>
        <input
          id="birthday"
          name="birthday"
          type="date"
          defaultValue={profile.birthday || ''}
          className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
        />
        <p className="text-xs text-gray-500 mt-1">생일에 3,000P를 드려요.</p>
      </div>

      {/* 기본 배송지 섹션 */}
      <div className="pt-6 mt-6 border-t-2 border-gray-200">
        <h3 className="text-lg font-bold mb-4">기본 배송지</h3>
        <p className="text-sm text-gray-500 mb-4">
          체크아웃 시 자동으로 입력됩니다.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="default_postal_code" className="block text-sm font-semibold text-gray-700 mb-1">
              우편번호
            </label>
            <div className="flex gap-2">
              <input
                id="default_postal_code"
                name="default_postal_code"
                type="text"
                value={postalCode}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-gray-300 bg-gray-50"
                placeholder="주소 검색을 눌러주세요"
              />
              <AddressSearch onComplete={handleAddressComplete} />
            </div>
          </div>

          <div>
            <label htmlFor="default_address" className="block text-sm font-semibold text-gray-700 mb-1">
              주소
            </label>
            <input
              id="default_address"
              name="default_address"
              type="text"
              value={address}
              readOnly
              className="w-full px-4 py-3 border-2 border-gray-300 bg-gray-50"
              placeholder="주소 검색 버튼을 눌러주세요"
            />
          </div>

          <div>
            <label htmlFor="default_address_detail" className="block text-sm font-semibold text-gray-700 mb-1">
              상세 주소
            </label>
            <input
              id="default_address_detail"
              name="default_address_detail"
              type="text"
              defaultValue={profile.default_address_detail || ''}
              placeholder="101동 1234호"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label htmlFor="default_memo" className="block text-sm font-semibold text-gray-700 mb-1">
              기본 배송 메모
            </label>
            <input
              id="default_memo"
              name="default_memo"
              type="text"
              defaultValue={profile.default_memo || ''}
              placeholder="부재시 문 앞에 놓아주세요"
              className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        프로필 저장
      </Button>
    </form>
  )
}
