-- =====================================================
-- 004: 반품/환불 워크플로우 스키마
-- =====================================================

-- 1. orders 테이블에 반품 관련 컬럼 추가
-- =====================================================

-- return_status: 반품 상태
-- none: 반품 요청 없음
-- requested: 반품 요청됨 (고객 또는 관리자가 접수)
-- received: 반품 물품 도착
-- approved: 검수 통과 (환불 가능 상태)
-- rejected: 검수 실패 (환불 불가)
-- refunded: 환불 완료

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS return_status TEXT DEFAULT 'none'
CHECK (return_status IN ('none', 'requested', 'received', 'approved', 'rejected', 'refunded'));

-- 반품 사유
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_reason TEXT;

-- 검수 메모 (관리자가 작성)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_inspection_notes TEXT;

-- 거부 사유 (rejected 시)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_rejection_reason TEXT;

-- 타임스탬프
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_received_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_approved_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_rejected_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Stripe 환불 관련
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount INTEGER; -- 부분 환불 지원

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_return_status ON orders(return_status) WHERE return_status != 'none';

-- 2. 반품 상태 로그 테이블 (선택적 - 상세 기록용)
-- =====================================================

CREATE TABLE IF NOT EXISTS return_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_logs_order_id ON return_status_logs(order_id);

-- RLS
ALTER TABLE return_status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage return logs" ON return_status_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. 반품 상태 전이 검증 함수
-- =====================================================

-- 유효한 상태 전이인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_valid_return_transition(
  current_status TEXT,
  new_status TEXT,
  fulfillment_status TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- none -> requested: 언제든 가능 (배송 전/후 무관)
  IF current_status = 'none' AND new_status = 'requested' THEN
    RETURN TRUE;
  END IF;

  -- requested -> received: 반품 물품 도착
  IF current_status = 'requested' AND new_status = 'received' THEN
    RETURN TRUE;
  END IF;

  -- received -> approved: 검수 통과
  IF current_status = 'received' AND new_status = 'approved' THEN
    RETURN TRUE;
  END IF;

  -- received -> rejected: 검수 실패
  IF current_status = 'received' AND new_status = 'rejected' THEN
    RETURN TRUE;
  END IF;

  -- approved -> refunded: 환불 완료
  IF current_status = 'approved' AND new_status = 'refunded' THEN
    RETURN TRUE;
  END IF;

  -- 배송 전(unfulfilled, processing)이면 바로 환불 가능
  -- none -> refunded (배송 전 즉시 환불)
  IF current_status = 'none' AND new_status = 'refunded'
     AND fulfillment_status IN ('unfulfilled', 'processing') THEN
    RETURN TRUE;
  END IF;

  -- requested -> refunded (배송 전 환불 요청 후 즉시 환불)
  IF current_status = 'requested' AND new_status = 'refunded'
     AND fulfillment_status IN ('unfulfilled', 'processing') THEN
    RETURN TRUE;
  END IF;

  -- 그 외는 모두 불허
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 4. 반품 상태 전이 트리거
-- =====================================================

CREATE OR REPLACE FUNCTION log_return_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- return_status가 변경된 경우만 로그
  IF OLD.return_status IS DISTINCT FROM NEW.return_status THEN
    INSERT INTO return_status_logs (
      order_id,
      from_status,
      to_status,
      reason,
      notes,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.return_status,
      NEW.return_status,
      CASE
        WHEN NEW.return_status = 'requested' THEN NEW.return_reason
        WHEN NEW.return_status = 'rejected' THEN NEW.return_rejection_reason
        ELSE NULL
      END,
      NEW.return_inspection_notes,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS return_status_change_trigger ON orders;
CREATE TRIGGER return_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_return_status_change();
