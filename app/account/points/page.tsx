import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { getUserPointBalance, getUserPointHistory } from '@/features/points/actions/get-points'

export const dynamic = 'force-dynamic'

export default async function PointsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [balance, history] = await Promise.all([
    getUserPointBalance(),
    getUserPointHistory(),
  ])

  return (
    <div>
      <h2 className="text-lg font-bold mb-6">적립금</h2>

      {/* 잔액 카드 */}
      <div className="bg-black text-white p-6 rounded-sm mb-6">
        <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mb-2">현재 적립금</p>
        <p className="text-4xl font-black tabular-nums">
          {balance.toLocaleString('ko-KR')}
          <span className="text-xl ml-1 font-normal text-white/60">P</span>
        </p>
        <p className="text-xs text-white/40 mt-3">
          ※ 구매금액의 1%가 자동 적립됩니다
        </p>
      </div>

      {/* 안내 */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm mb-6 text-xs text-gray-600 space-y-1.5">
        <p>• 결제 완료 후 자동으로 구매금액의 1%가 적립됩니다</p>
        <p>• 적립금은 다음 구매 시 1P = 1원으로 사용 가능합니다</p>
        <p>• 최소 사용 금액: 1,000P 이상</p>
        <p>• 환불 시 사용/적립 포인트가 취소될 수 있습니다</p>
      </div>

      {/* 내역 */}
      <div>
        <h3 className="text-sm font-bold mb-3 text-gray-700">적립/사용 내역</h3>

        {history.length === 0 ? (
          <div className="bg-white border border-gray-100 p-10 text-center">
            <p className="text-gray-400 text-sm">적립금 내역이 없습니다</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
            {history.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(tx.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`text-sm font-bold tabular-nums ${
                  tx.type === 'earn' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount.toLocaleString('ko-KR')}P
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
