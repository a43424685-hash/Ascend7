-- Migration 022: Event coupon system
-- events 테이블에 할인 설정 컬럼 추가 + 1인 1회 사용 기록 테이블

-- 1. events 테이블 할인 컬럼 추가
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percent', 'amount')) DEFAULT 'percent',
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS single_use BOOLEAN NOT NULL DEFAULT false;

-- 2. 이벤트 쿠폰 1인 1회 사용 기록 테이블
CREATE TABLE IF NOT EXISTS event_coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ecu_event_user ON event_coupon_usages(event_id, user_id);

ALTER TABLE event_coupon_usages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'event_coupon_usages'
    AND policyname = 'service_role_all_event_coupon_usages'
  ) THEN
    CREATE POLICY "service_role_all_event_coupon_usages" ON event_coupon_usages FOR ALL USING (true);
  END IF;
END $$;
