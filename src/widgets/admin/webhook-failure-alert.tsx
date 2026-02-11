'use client'

/**
 * 관리자 대시보드 - Webhook 실패 알림 카드
 */

import { useState, useEffect, useTransition } from 'react'
import {
  getWebhookFailureStats,
  getWebhookFailures,
  retryWebhookFailure,
  skipWebhookFailure,
  triggerRetryJob,
  type WebhookFailure,
  type WebhookFailureStats,
} from '@/features/admin/actions/webhook-failures'

export function WebhookFailureAlert() {
  const [stats, setStats] = useState<WebhookFailureStats | null>(null)
  const [failures, setFailures] = useState<WebhookFailure[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [isPending, startTransition] = useTransition()

  const loadData = () => {
    startTransition(async () => {
      const [statsData, failuresData] = await Promise.all([
        getWebhookFailureStats(),
        getWebhookFailures(),
      ])
      setStats(statsData)
      setFailures(failuresData)
    })
  }

  useEffect(() => {
    loadData()
    // 30초마다 자동 새로고침
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRetry = async (failureId: string) => {
    const result = await retryWebhookFailure(failureId)
    if (result.success) {
      alert('재처리 대기열에 추가되었습니다.')
      loadData()
    } else {
      alert(`실패: ${result.error}`)
    }
  }

  const handleSkip = async (failureId: string) => {
    if (!confirm('이 항목을 스킵 처리하시겠습니까? 주문이 생성되지 않습니다.')) return
    const result = await skipWebhookFailure(failureId)
    if (result.success) {
      alert('스킵 처리되었습니다.')
      loadData()
    } else {
      alert(`실패: ${result.error}`)
    }
  }

  const handleTriggerJob = async () => {
    const result = await triggerRetryJob()
    if (result.success) {
      alert(`재처리 완료: ${result.data.succeeded}건 성공, ${result.data.failed}건 실패`)
      loadData()
    } else {
      alert(`실패: ${result.error}`)
    }
  }

  // 문제 없으면 표시 안 함
  if (!stats || (stats.pending_count === 0 && stats.failed_count === 0)) {
    return null
  }

  const hasIssues = stats.pending_count > 0 || stats.failed_count > 0

  return (
    <div className={`border-2 p-4 mb-6 ${stats.failed_count > 0 ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{stats.failed_count > 0 ? '🚨' : '⚠️'}</span>
          <div>
            <h3 className="font-bold text-lg">
              {stats.failed_count > 0 ? '결제 처리 실패' : '결제 처리 대기 중'}
            </h3>
            <p className="text-sm text-gray-600">
              대기: {stats.pending_count}건 | 실패: {stats.failed_count}건 | 처리 중: {stats.processing_count}건
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTriggerJob}
            disabled={isPending}
            className="px-3 py-1 text-sm bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            지금 재처리
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm border-2 border-black hover:bg-black hover:text-white"
          >
            {showDetails ? '접기' : '상세'}
          </button>
        </div>
      </div>

      {showDetails && failures.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-500 mb-2">
            자동 재처리: 5분마다 실행 (지수 백오프 적용)
          </div>
          {failures.map((failure) => (
            <div
              key={failure.id}
              className="bg-white border border-gray-200 p-3 text-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-xs text-gray-500">
                    Event: {failure.event_id.slice(0, 20)}...
                  </p>
                  <p className="text-red-600 mt-1">{failure.error_message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    시도: {failure.attempts}/{failure.max_attempts} |{' '}
                    상태: {failure.status} |{' '}
                    {failure.next_retry_at && `다음 시도: ${new Date(failure.next_retry_at).toLocaleString('ko-KR')}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  {failure.status !== 'succeeded' && (
                    <>
                      <button
                        onClick={() => handleRetry(failure.id)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600"
                      >
                        재시도
                      </button>
                      <button
                        onClick={() => handleSkip(failure.id)}
                        className="px-2 py-1 text-xs bg-gray-500 text-white hover:bg-gray-600"
                      >
                        스킵
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
