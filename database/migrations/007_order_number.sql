-- 007: 주문번호(order_number) 컬럼 추가
-- 게스트 주문 조회를 위한 사용자 친화적 주문번호

-- 주문번호 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- 기존 주문에 주문번호 부여 (A7-YYMMDD-XXXX 형식)
UPDATE orders
SET order_number = 'A7-' || TO_CHAR(created_at, 'YYMMDD') || '-' || UPPER(SUBSTRING(id::text, 1, 4))
WHERE order_number IS NULL;

-- 주문번호 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- customer_phone 인덱스 (게스트 주문 조회 시 사용)
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
