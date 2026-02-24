'use client'

import { useState, useTransition } from 'react'
import { toggleComingSoon } from '@/features/admin/actions/toggle-coming-soon'

interface ComingSoonToggleProps {
  productId: string
  initialValue: boolean
}

export function ComingSoonToggle({ productId, initialValue }: ComingSoonToggleProps) {
  const [isOn, setIsOn] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const newValue = !isOn
    setIsOn(newValue) // optimistic update

    startTransition(async () => {
      const result = await toggleComingSoon(productId, newValue)
      if (!result.success) {
        setIsOn(!newValue) // 실패 시 되돌리기
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isOn ? '준비중 해제' : '준비중으로 설정'}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        isOn ? 'bg-orange-400' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          isOn ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
