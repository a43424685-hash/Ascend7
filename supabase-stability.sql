-- ========================================
-- ASCEND7 프로덕션 안정화 SQL
-- ========================================
-- 목적: 결제/주문 시스템의 동시성 제어 및 안전성 강화
-- 적용 순서: 
--   1. 이 파일 전체를 Supabase SQL Editor에서 실행
--   2. 웹훅 코드 배포
--   3. 테스트

-- ========================================
-- 1. 재고 동시성 방지
-- ========================================

-- 원자적 재고 차감 함수 (Oversell 방지)
CREATE OR REPLACE FUNCTION atomic_decrement_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  new_stock INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_current_stock INTEGER;
  v_new_stock INTEGER;
BEGIN
  -- 1. 행 잠금 + 현재 재고 조회 (FOR UPDATE = 트랜잭션 끝날 때까지 다른 요청 대기)
  SELECT stock INTO v_current_stock
  FROM variants
  WHERE id = p_variant_id
  FOR UPDATE;

  -- 2. variant가 없는 경우
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Variant not found';
    RETURN;
  END IF;

  -- 3. 재고 부족
  IF v_current_stock < p_quantity THEN
    RETURN QUERY SELECT FALSE, v_current_stock, format('Insufficient stock. Available: %s, Requested: %s', v_current_stock, p_quantity);
    RETURN;
  END IF;

  -- 4. 재고 차감 (음수 방지)
  v_new_stock := GREATEST(v_current_stock - p_quantity, 0);
  
  UPDATE variants
  SET 
    stock = v_new_stock,
    updated_at = NOW()
  WHERE id = p_variant_id;

  -- 5. 성공 반환
  RETURN QUERY SELECT TRUE, v_new_stock, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 재고 복구 함수 (주문 취소/환불 시)
CREATE OR REPLACE FUNCTION atomic_restore_stock(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  new_stock INTEGER
) AS $$
DECLARE
  v_new_stock INTEGER;
BEGIN
  UPDATE variants
  SET 
    stock = stock + p_quantity,
    updated_at = NOW()
  WHERE id = p_variant_id
  RETURNING stock INTO v_new_stock;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, v_new_stock;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 2. Stripe 웹훅 멱등성 (중복 처리 방지)
-- ========================================

-- 처리된 Stripe 이벤트 저장 테이블
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (빠른 중복 체크)
CREATE INDEX IF NOT EXISTS idx_processed_events_event_id ON processed_stripe_events(event_id);
CREATE INDEX IF NOT EXISTS idx_processed_events_created_at ON processed_stripe_events(created_at DESC);

-- 오래된 이벤트 자동 정리 (30일 이상)
CREATE OR REPLACE FUNCTION cleanup_old_stripe_events()
RETURNS void AS $$
BEGIN
  DELETE FROM processed_stripe_events
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. 주문 상태 관리 강화
-- ========================================

-- 주문 상태 enum 업데이트 (기존 것 제거 후 재생성)
DO $$ BEGIN
  -- 1. 기존 enum 타입 제거 (있으면)
  DROP TYPE IF EXISTS order_status_enum CASCADE;
  
  -- 2. 새 enum 타입 생성
  CREATE TYPE order_status_enum AS ENUM (
    'pending',      -- 결제 대기
    'paid',         -- 결제 완료
    'preparing',    -- 상품 준비 중
    'shipped',      -- 배송 중
    'delivered',    -- 배송 완료
    'canceled',     -- 취소됨
    'refunded'      -- 환불됨
  );
END $$;

-- orders 테이블의 status 컬럼 타입 변경
-- 기존 기본값 제거 → 타입 변경 → 기본값 다시 설정
ALTER TABLE orders 
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE orders 
  ALTER COLUMN status TYPE order_status_enum 
  USING status::text::order_status_enum;

ALTER TABLE orders 
  ALTER COLUMN status SET DEFAULT 'pending'::order_status_enum;

-- 주문 상태 변경 로그 테이블
CREATE TABLE IF NOT EXISTS order_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status_enum,
  to_status order_status_enum NOT NULL,
  changed_by UUID REFERENCES auth.users(id),  -- 누가 변경했는지
  reason TEXT,  -- 변경 이유
  metadata JSONB,  -- 추가 정보 (관리자 메모 등)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_logs_order_id ON order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_created_at ON order_status_logs(created_at DESC);

-- 주문 상태 변경 트리거 함수 (자동 로깅)
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태가 실제로 변경된 경우만 로그
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_logs (
      order_id,
      from_status,
      to_status,
      changed_by,
      reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),  -- 현재 사용자 (없으면 NULL)
      'Status updated'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (이미 있으면 삭제 후 재생성)
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- ========================================
-- 4. RLS 정책 강화
-- ========================================

-- 4-1. processed_stripe_events: 웹훅만 접근 (public 읽기 불가)
ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only" ON processed_stripe_events;
CREATE POLICY "Service role only" ON processed_stripe_events
  FOR ALL USING (FALSE);  -- 일반 사용자 접근 불가, service_role만 가능

-- 4-2. order_status_logs: 읽기는 본인 주문만, 쓰기는 시스템/관리자만
ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view logs for their orders" ON order_status_logs;
CREATE POLICY "Users can view logs for their orders" ON order_status_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_logs.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert logs" ON order_status_logs;
CREATE POLICY "System can insert logs" ON order_status_logs
  FOR INSERT WITH CHECK (TRUE);  -- 트리거/웹훅에서 삽입 허용

-- 4-3. orders: 본인 주문만 조회, 생성은 웹훅만
-- 기존 정책 확인 및 강화
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- 일반 사용자는 주문 생성/수정 불가 (웹훅만 가능)
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;
DROP POLICY IF EXISTS "Users cannot create orders directly" ON orders;
CREATE POLICY "Users cannot create orders directly" ON orders
  FOR INSERT WITH CHECK (FALSE);  -- service_role만 가능

DROP POLICY IF EXISTS "Users cannot update orders directly" ON orders;
CREATE POLICY "Users cannot update orders directly" ON orders
  FOR UPDATE USING (FALSE);  -- service_role만 가능

-- 4-4. order_items: 본인 주문의 아이템만 조회
DROP POLICY IF EXISTS "Users can view items of their orders" ON order_items;
CREATE POLICY "Users can view items of their orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- 4-5. variants: 재고 수정은 시스템/관리자만
-- 기존 정책 유지하되, 일반 사용자의 재고 수정 차단 확인
-- (이미 admin RLS에서 처리되었지만 한 번 더 확인)

-- ========================================
-- 5. 유틸리티 뷰 (관리자용 대시보드)
-- ========================================

-- 재고 부족 상품 조회 뷰
CREATE OR REPLACE VIEW low_stock_variants AS
SELECT 
  v.id,
  v.sku,
  p.name AS product_name,
  v.color,
  v.size,
  v.stock,
  v.price
FROM variants v
JOIN products p ON p.id = v.product_id
WHERE v.stock < 10  -- 재고 10개 미만
  AND v.is_active = TRUE
ORDER BY v.stock ASC;

-- 최근 주문 상태 변경 이력 뷰
CREATE OR REPLACE VIEW recent_order_status_changes AS
SELECT 
  osl.id,
  osl.order_id,
  o.total,
  o.user_id,
  osl.from_status,
  osl.to_status,
  osl.changed_by,
  osl.reason,
  osl.created_at
FROM order_status_logs osl
JOIN orders o ON o.id = osl.order_id
ORDER BY osl.created_at DESC
LIMIT 100;

-- ========================================
-- 완료!
-- ========================================
-- 다음 단계:
-- 1. Stripe 웹훅 코드 업데이트 (atomic_decrement_stock 사용)
-- 2. Admin 대시보드에 low_stock_variants 표시
-- 3. 테스트: 동시 주문 시뮬레이션

