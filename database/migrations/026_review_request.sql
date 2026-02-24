-- 구매 후 리뷰 요청 이메일 발송 여부 추적
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS review_request_sent_at TIMESTAMPTZ;

-- 인덱스: CRON에서 미발송 + 배송완료 주문 빠르게 조회
CREATE INDEX IF NOT EXISTS idx_orders_review_request
  ON orders (fulfillment_status, review_request_sent_at)
  WHERE review_request_sent_at IS NULL;
