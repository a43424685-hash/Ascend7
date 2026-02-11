'use server'

/**
 * 관리자 Webhook 실패 관리 Server Actions
 */

import { createClient } from '@/shared/lib/supabase/server'
import { requireAdmin } from '@/shared/lib/auth/admin'

export interface WebhookFailure {
  id: string
  event_id: string
  event_type: string
  error_message: string | null
  attempts: number
  max_attempts: number
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'skipped'
  next_retry_at: string | null
  created_at: string
  updated_at: string
}

export interface WebhookFailureStats {
  pending_count: number
  failed_count: number
  processing_count: number
  total_count: number
}

/**
 * 실패 큐 통계 조회
 */
export async function getWebhookFailureStats(): Promise<WebhookFailureStats> {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_webhook_failure_stats')

  if (error || !data || data.length === 0) {
    return { pending_count: 0, failed_count: 0, processing_count: 0, total_count: 0 }
  }

  return data[0] as WebhookFailureStats
}

/**
 * 실패 목록 조회
 */
export async function getWebhookFailures(): Promise<WebhookFailure[]> {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stripe_webhook_failures')
    .select('id, event_id, event_type, error_message, attempts, max_attempts, status, next_retry_at, created_at, updated_at')
    .in('status', ['pending', 'failed', 'processing'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch webhook failures:', error)
    return []
  }

  return (data || []) as WebhookFailure[]
}

/**
 * 수동 재처리 트리거
 */
export async function retryWebhookFailure(failureId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // 상태를 pending으로 변경하고 next_retry_at을 현재로 설정
  const { error } = await supabase
    .from('stripe_webhook_failures')
    .update({
      status: 'pending',
      next_retry_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', failureId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * 실패 항목 스킵 처리
 */
export async function skipWebhookFailure(failureId: string) {
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from('stripe_webhook_failures')
    .update({
      status: 'skipped',
      updated_at: new Date().toISOString(),
    })
    .eq('id', failureId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Cron job 수동 실행
 */
export async function triggerRetryJob() {
  await requireAdmin()

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const cronSecret = process.env.CRON_SECRET || ''

    const response = await fetch(`${baseUrl}/api/cron/retry-webhooks`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to trigger retry job' }
    }

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
