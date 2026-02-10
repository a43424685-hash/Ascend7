-- ========================================
-- ASCEND7 프로덕션 설정 (통합 버전)
-- ========================================
-- 목적: 안정화 함수/테이블 + RLS 정책을 한 번에 적용
-- 실행 방법:
--   1. Supabase Dashboard → SQL Editor
--   2. 이 파일 전체 복사 → 붙여넣기 → Run
--   3. "Success. No rows returned" 확인

-- ========================================
-- PART 1: 재고 동시성 방지
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
-- PART 2: Stripe 웹훅 멱등성
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
-- PART 3: 주문 상태 관리 강화
-- ========================================

-- 주문 상태 enum 생성/업데이트
DO $$ 
BEGIN
  -- 기존 enum 타입 제거 (있으면)
  DROP TYPE IF EXISTS order_status_enum CASCADE;
  
  -- 새 enum 타입 생성
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
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  metadata JSONB,
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
      auth.uid(),
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
-- PART 4: 유틸리티 뷰
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
WHERE v.stock < 10
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
-- PART 5: RLS 정책
-- ========================================

-- 5-1. 기존 정책 모두 제거
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
DROP POLICY IF EXISTS "Anyone can view product_images" ON product_images;
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Admin can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Admin can update product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can update product_images" ON product_images;
DROP POLICY IF EXISTS "Admin can delete product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can delete product_images" ON product_images;

DROP POLICY IF EXISTS "Variants are viewable by everyone" ON variants;
DROP POLICY IF EXISTS "Anyone can view variants" ON variants;
DROP POLICY IF EXISTS "Anyone can view active variants" ON variants;
DROP POLICY IF EXISTS "Admin can insert variants" ON variants;
DROP POLICY IF EXISTS "Authenticated users can insert variants" ON variants;
DROP POLICY IF EXISTS "Admin can update variants" ON variants;
DROP POLICY IF EXISTS "Authenticated users can update variants" ON variants;
DROP POLICY IF EXISTS "Admin can delete variants" ON variants;
DROP POLICY IF EXISTS "Authenticated users can delete variants" ON variants;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;
DROP POLICY IF EXISTS "Users cannot create orders directly" ON orders;
DROP POLICY IF EXISTS "Users cannot update orders directly" ON orders;
DROP POLICY IF EXISTS "no_direct_insert_orders" ON orders;
DROP POLICY IF EXISTS "no_direct_update_orders" ON orders;
DROP POLICY IF EXISTS "no_direct_delete_orders" ON orders;
DROP POLICY IF EXISTS "auth_read_all_orders" ON orders;
DROP POLICY IF EXISTS "anon_read_own_orders" ON orders;
DROP POLICY IF EXISTS "auth_update_order_status" ON orders;

DROP POLICY IF EXISTS "Order items are viewable by order owner" ON order_items;
DROP POLICY IF EXISTS "Anyone can view order_items" ON order_items;
DROP POLICY IF EXISTS "Users can view items of their orders" ON order_items;
DROP POLICY IF EXISTS "auth_read_own_order_items" ON order_items;
DROP POLICY IF EXISTS "anon_read_own_order_items" ON order_items;
DROP POLICY IF EXISTS "no_direct_insert_order_items" ON order_items;

DROP POLICY IF EXISTS "Users can view logs for their orders" ON order_status_logs;
DROP POLICY IF EXISTS "System can insert logs" ON order_status_logs;
DROP POLICY IF EXISTS "auth_read_own_order_logs" ON order_status_logs;
DROP POLICY IF EXISTS "system_insert_order_logs" ON order_status_logs;

DROP POLICY IF EXISTS "Service role only" ON processed_stripe_events;
DROP POLICY IF EXISTS "service_role_only_stripe_events" ON processed_stripe_events;

DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "public_read_product_image_storage" ON storage.objects;
DROP POLICY IF EXISTS "auth_insert_product_image_storage" ON storage.objects;
DROP POLICY IF EXISTS "auth_update_product_image_storage" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_product_image_storage" ON storage.objects;

-- 5-2. RLS 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;

-- 5-3. Products 정책
CREATE POLICY "public_read_products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "auth_insert_products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "auth_update_products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_delete_products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- 5-4. Product Images 정책
CREATE POLICY "public_read_product_images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "auth_insert_product_images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "auth_update_product_images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_delete_product_images"
  ON product_images FOR DELETE
  TO authenticated
  USING (true);

-- 5-5. Variants 정책
CREATE POLICY "public_read_variants"
  ON variants FOR SELECT
  USING (true);

CREATE POLICY "auth_insert_variants"
  ON variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "auth_update_variants"
  ON variants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_delete_variants"
  ON variants FOR DELETE
  TO authenticated
  USING (true);

-- 5-6. Orders 정책 (⚠️ 중요!)
CREATE POLICY "auth_read_all_orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "anon_read_own_orders"
  ON orders FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- 일반 사용자 주문 생성/삭제 차단 (웹훅만 가능)
CREATE POLICY "no_direct_insert_orders"
  ON orders FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "no_direct_delete_orders"
  ON orders FOR DELETE
  USING (FALSE);

-- 관리자는 상태 업데이트 가능
CREATE POLICY "auth_update_order_status"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5-7. Order Items 정책
CREATE POLICY "auth_read_own_order_items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
    )
  );

CREATE POLICY "anon_read_own_order_items"
  ON order_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id IS NULL
    )
  );

-- 일반 사용자 직접 생성 차단 (웹훅만)
CREATE POLICY "no_direct_insert_order_items"
  ON order_items FOR INSERT
  WITH CHECK (FALSE);

-- 5-8. Order Status Logs 정책
CREATE POLICY "auth_read_own_order_logs"
  ON order_status_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_logs.order_id
    )
  );

CREATE POLICY "system_insert_order_logs"
  ON order_status_logs FOR INSERT
  WITH CHECK (TRUE);

-- 5-9. Processed Stripe Events 정책
CREATE POLICY "service_role_only_stripe_events"
  ON processed_stripe_events FOR ALL
  USING (FALSE);

-- 5-10. Storage 정책 (product-images 버킷)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_product_image_storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "auth_insert_product_image_storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "auth_update_product_image_storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "auth_delete_product_image_storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- ========================================
-- 완료!
-- ========================================
-- ✅ 재고 동시성 방지 (atomic_decrement_stock)
-- ✅ 웹훅 멱등성 (processed_stripe_events)
-- ✅ 주문 상태 관리 (order_status_logs + 트리거)
-- ✅ RLS 정책 (모든 테이블)
-- ✅ 유틸리티 뷰 (재고 부족 알림)

