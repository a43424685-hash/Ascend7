'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Error Boundary]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-xl font-bold mb-2">문제가 발생했습니다</h2>
      <p className="text-sm text-gray-500 mb-6">
        일시적인 오류입니다. 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}
