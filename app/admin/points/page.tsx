'use client'

import { useState, useTransition } from 'react'
import { getUserPointInfoByEmail, adminAdjustPoints, type UserPointInfo } from '@/features/points/actions/admin-adjust-points'

export default function AdminPointsPage() {
  const [email, setEmail] = useState('')
  const [userInfo, setUserInfo] = useState<UserPointInfo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSearch = () => {
    if (!email.trim()) return
    setNotFound(false)
    setUserInfo(null)
    setResult(null)
    startTransition(async () => {
      const info = await getUserPointInfoByEmail(email.trim())
      if (!info) setNotFound(true)
      else setUserInfo(info)
    })
  }

  const handleAdjust = () => {
    if (!userInfo || !amount || !description) return
    const numAmount = parseInt(amount)
    if (isNaN(numAmount) || numAmount === 0) return
    startTransition(async () => {
      const res = await adminAdjustPoints(userInfo.userId, numAmount, description)
      if (res.success) {
        setResult(`완료! ${numAmount > 0 ? '+' : ''}${numAmount.toLocaleString()}P 조정됨`)
        setUserInfo({ ...userInfo, balance: Math.max(0, userInfo.balance + numAmount) })
        setAmount('')
        setDescription('')
      } else {
        setResult(`오류: ${res.error}`)
      }
    })
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">포인트 수동 조정</h1>
        <p className="text-xs text-gray-500">회원 이메일로 검색 후 포인트를 지급하거나 차감합니다.</p>
      </div>

      {/* 유저 검색 */}
      <div className="bg-white border border-gray-200 rounded-sm p-5 mb-5">
        <label className="block text-xs font-medium text-gray-700 mb-2">회원 이메일 검색</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="user@email.com"
            className="flex-1 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
          <button
            onClick={handleSearch}
            disabled={isPending}
            className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            검색
          </button>
        </div>
        {notFound && <p className="text-xs text-red-500 mt-2">해당 이메일의 회원을 찾을 수 없습니다.</p>}
      </div>

      {/* 유저 정보 + 조정 */}
      {userInfo && (
        <div className="bg-white border border-gray-200 rounded-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium">{userInfo.email}</p>
              <p className="text-xs text-gray-500 mt-0.5">현재 잔액</p>
            </div>
            <p className="text-2xl font-black tabular-nums">
              {userInfo.balance.toLocaleString()}
              <span className="text-base font-normal text-gray-400 ml-1">P</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              조정 금액 (양수=지급, 음수=차감)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="예: 3000 (지급) 또는 -1000 (차감)"
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">사유 *</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="예: 이벤트 당첨 보상"
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          {result && (
            <div className={`p-3 text-sm rounded-sm ${result.startsWith('오류') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {result}
            </div>
          )}

          <button
            onClick={handleAdjust}
            disabled={isPending || !amount || !description}
            className="w-full bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isPending ? '처리 중...' : '포인트 조정'}
          </button>
        </div>
      )}
    </div>
  )
}
