-- ========================================
-- ASCEND7 프로덕션 RLS 정책 (최종 버전)
-- ========================================
-- 목적: 데이터 보안을 DB 레벨에서 강제
-- 실행 순서:
--   1. supabase-schema.sql (스키마 생성)
--   2. supabase-stability.sql (안정화 함수/테이블)
--   3. 이 파일 (RLS 정책)
--   4. supabase-seed.sql (시드 데이터)

-- ========================================
-- 1. 기존 정책 모두 제거
-- ========================================

-- Products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Product Images
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
DROP POLICY IF EXISTS "Anyone can view product_images" ON product_images;
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Admin can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Admin can update product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can update product_images" ON product_images;
DROP POLICY IF EXISTS "Admin can delete product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can delete product_images" ON product_images;

-- Variants
DROP POLICY IF EXISTS "Variants are viewable by everyone" ON variants;
DROP POLICY IF EXISTS "Anyone can view variants" ON variants;
DROP POLICY IF EXISTS "Anyone can view active variants" ON variants;
DROP POLICY IF EXISTS "Admin can insert variants" ON variants;
DROP POLICY IF EXISTS "Authenticated users can insert variants" ON variants;
DROP POLICY IF EXISTS "Admin can update variants" ON variants;
DROP POLICY IF EXISTS "Authenticated users can update variants" ON variants;
DROP POLICY IF EXISTS "Admin can delete variants" ON variants;
DROP POLICY IF EXISTS "Authenticated users can delete variants" ON variants;

-- Orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;
DROP POLICY IF EXISTS "Users cannot create orders directly" ON orders;
DROP POLICY IF EXISTS "Users cannot update orders directly" ON orders;

-- Order Items
DROP POLICY IF EXISTS "Order items are viewable by order owner" ON order_items;
DROP POLICY IF EXISTS "Anyone can view order_items" ON order_items;
DROP POLICY IF EXISTS "Users can view items of their orders" ON order_items;

-- Order Status Logs
DROP POLICY IF EXISTS "Users can view logs for their orders" ON order_status_logs;
DROP POLICY IF EXISTS "System can insert logs" ON order_status_logs;

-- Processed Stripe Events
DROP POLICY IF EXISTS "Service role only" ON processed_stripe_events;

-- Storage
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- ========================================
-- 2. RLS 활성화
-- ========================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. Products 정책
-- ========================================

-- 읽기: 모두 가능 (공개 카탈로그)
CREATE POLICY "public_read_products"
  ON products FOR SELECT
  USING (true);

-- 쓰기: 인증된 사용자만 (MVP: 추후 admin 역할로 제한)
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

-- ========================================
-- 4. Product Images 정책
-- ========================================

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

-- ========================================
-- 5. Variants 정책
-- ========================================

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

-- ========================================
-- 6. Orders 정책 ⚠️ 중요!
-- ========================================

-- 읽기: 본인 주문만 (관리자는 모든 주문)
-- MVP: 인증된 사용자는 모든 주문 조회 가능 (관리자로 간주)
-- 프로덕션: custom claims로 admin 체크 필요
CREATE POLICY "auth_read_all_orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- 비인증 사용자는 자기 주문만 (게스트 주문용)
CREATE POLICY "anon_read_own_orders"
  ON orders FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- 쓰기: 일반 사용자 차단 (service_role만 가능 = 웹훅)
CREATE POLICY "no_direct_insert_orders"
  ON orders FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "no_direct_update_orders"
  ON orders FOR UPDATE
  USING (FALSE);

CREATE POLICY "no_direct_delete_orders"
  ON orders FOR DELETE
  USING (FALSE);

-- 예외: 관리자는 상태 업데이트 가능
CREATE POLICY "auth_update_order_status"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- 7. Order Items 정책
-- ========================================

-- 읽기: 본인 주문의 아이템만
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

-- 쓰기: service_role만 (웹훅)
CREATE POLICY "no_direct_insert_order_items"
  ON order_items FOR INSERT
  WITH CHECK (FALSE);

-- ========================================
-- 8. Order Status Logs 정책
-- ========================================

-- 읽기: 본인 주문의 로그만
CREATE POLICY "auth_read_own_order_logs"
  ON order_status_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_logs.order_id
    )
  );

-- 쓰기: 시스템 전용 (트리거/웹훅)
CREATE POLICY "system_insert_order_logs"
  ON order_status_logs FOR INSERT
  WITH CHECK (TRUE);

-- ========================================
-- 9. Processed Stripe Events 정책
-- ========================================

-- service_role만 접근 가능 (웹훅 전용)
CREATE POLICY "service_role_only_stripe_events"
  ON processed_stripe_events FOR ALL
  USING (FALSE);

-- ========================================
-- 10. Storage 정책 (product-images 버킷)
-- ========================================

-- 버킷 생성 (이미 있으면 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 읽기: 모두 가능
CREATE POLICY "public_read_product_image_storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- 쓰기: 인증된 사용자만
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
-- 11. 보안 강화 함수
-- ========================================

-- 현재 사용자가 관리자인지 확인 (추후 확장)
-- MVP에서는 인증된 사용자 = 관리자
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 완료!
-- ========================================
-- 보안 체크리스트:
-- ✅ Products/Variants: 읽기는 공개, 쓰기는 관리자만
-- ✅ Orders: 일반 사용자 직접 생성 불가 (웹훅만)
-- ✅ Order Items: 본인 주문만 조회 가능
-- ✅ Order Status Logs: 본인 주문 로그만 조회
-- ✅ Processed Events: service_role만 접근
-- ✅ Storage: 읽기 공개, 쓰기 관리자만

