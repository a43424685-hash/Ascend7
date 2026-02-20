-- 020_tosspayments.sql
-- TossPayments 결제 전환을 위한 orders 테이블 컬럼 추가
-- 기존 Stripe 데이터(stripe_session_id 등)는 유지

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tosspayments_payment_key TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT; -- 'stripe' | 'tosspayments'

-- TossPayments payment_key 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_tosspayments_payment_key
  ON orders(tosspayments_payment_key)
  WHERE tosspayments_payment_key IS NOT NULL;
