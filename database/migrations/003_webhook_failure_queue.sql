-- ========================================
-- 003: Webhook 실패 큐 & 멱등성 강화
-- ========================================

-- 1. orders.stripe_session_id에 유니크 제약 추가 (멱등 업서트용)
-- NULL은 여러 개 허용, 값 있으면 유니크
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session_id_unique
ON orders (stripe_session_id)
WHERE stripe_session_id IS NOT NULL;

-- 2. Webhook 실패 큐 테이블
CREATE TABLE IF NOT EXISTS stripe_webhook_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,           -- Stripe event ID
  event_type TEXT NOT NULL,                -- checkout.session.completed 등
  payload JSONB NOT NULL,                  -- 전체 이벤트 페이로드
  error_message TEXT,                      -- 마지막 에러 메시지
  attempts INTEGER DEFAULT 0,              -- 시도 횟수
  max_attempts INTEGER DEFAULT 5,          -- 최대 시도
  next_retry_at TIMESTAMPTZ,               -- 다음 재시도 시간
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_webhook_failures_status ON stripe_webhook_failures(status);
CREATE INDEX IF NOT EXISTS idx_webhook_failures_next_retry ON stripe_webhook_failures(next_retry_at) WHERE status = 'pending';

-- RLS
ALTER TABLE stripe_webhook_failures ENABLE ROW LEVEL SECURITY;

-- 관리자만 조회/수정 가능
DROP POLICY IF EXISTS "Admin can manage webhook failures" ON stripe_webhook_failures;
CREATE POLICY "Admin can manage webhook failures" ON stripe_webhook_failures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role은 항상 접근 가능 (webhook/cron용)
DROP POLICY IF EXISTS "Service role full access" ON stripe_webhook_failures;
CREATE POLICY "Service role full access" ON stripe_webhook_failures
  FOR ALL USING (true) WITH CHECK (true);

-- 3. 실패 카운트 조회 함수 (관리자 대시보드용)
CREATE OR REPLACE FUNCTION get_webhook_failure_stats()
RETURNS TABLE (
  pending_count BIGINT,
  failed_count BIGINT,
  processing_count BIGINT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    COUNT(*) FILTER (WHERE status = 'processing') as processing_count,
    COUNT(*) as total_count
  FROM stripe_webhook_failures;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
