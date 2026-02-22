'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endAt: string
  onExpired?: () => void
}

export function CountdownTimer({ endAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true })
        onExpired?.()
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ hours: h, minutes: m, seconds: s, expired: false })
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [endAt, onExpired])

  if (timeLeft.expired) {
    return <span className="text-gray-400 text-xs">종료된 세일</span>
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col items-center bg-black/80 text-white px-2 py-1 min-w-[36px]">
        <span className="text-lg font-black tabular-nums leading-none">{pad(timeLeft.hours)}</span>
        <span className="text-[9px] tracking-wider mt-0.5 opacity-60">시간</span>
      </div>
      <span className="text-white font-bold text-lg">:</span>
      <div className="flex flex-col items-center bg-black/80 text-white px-2 py-1 min-w-[36px]">
        <span className="text-lg font-black tabular-nums leading-none">{pad(timeLeft.minutes)}</span>
        <span className="text-[9px] tracking-wider mt-0.5 opacity-60">분</span>
      </div>
      <span className="text-white font-bold text-lg">:</span>
      <div className="flex flex-col items-center bg-black/80 text-white px-2 py-1 min-w-[36px]">
        <span className="text-lg font-black tabular-nums leading-none">{pad(timeLeft.seconds)}</span>
        <span className="text-[9px] tracking-wider mt-0.5 opacity-60">초</span>
      </div>
    </div>
  )
}
