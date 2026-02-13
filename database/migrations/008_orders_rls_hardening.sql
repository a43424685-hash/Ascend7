-- =====================================================
-- Migration 008: Orders/Storage RLS 보안 강화
--
-- 문제: 모든 인증된 사용자가 전체 주문을 읽고 수정 가능
-- 수정: 본인 주문만 조회, 관리자만 전체 조회/수정
-- =====================================================

-- is_admin() 함수 확인 (002에서 생성됨, 안전하게 재생성)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();

  RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Orders SELECT: 본인 주문 OR 관리자
-- =====================================================

DROP POLICY IF EXISTS "auth_read_all_orders" ON orders;

-- 관리자: 모든 주문 조회
CREATE POLICY "admin_read_all_orders" ON orders
  FOR SELECT TO authenticated
  USING (is_admin());

-- 일반 회원: 본인 주문만
CREATE POLICY "user_read_own_orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 게스트: user_id IS NULL인 주문만 (기존 유지)
-- anon_read_own_orders 정책은 이미 존재

-- =====================================================
-- Orders UPDATE: 관리자만
-- =====================================================

DROP POLICY IF EXISTS "auth_update_order_status" ON orders;
DROP POLICY IF EXISTS "no_direct_update_orders" ON orders;

CREATE POLICY "admin_update_orders" ON orders
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- Order Items SELECT: 본인 주문 아이템 OR 관리자
-- =====================================================

DROP POLICY IF EXISTS "auth_read_own_order_items" ON order_items;

CREATE POLICY "admin_read_all_order_items" ON order_items
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "user_read_own_order_items" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- =====================================================
-- Storage: admin만 쓰기
-- =====================================================

DROP POLICY IF EXISTS "auth_insert_product_image_storage" ON storage.objects;
DROP POLICY IF EXISTS "auth_update_product_image_storage" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_product_image_storage" ON storage.objects;

CREATE POLICY "admin_insert_product_image_storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "admin_update_product_image_storage" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "admin_delete_product_image_storage" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());

-- =====================================================
-- 완료!
-- =====================================================
-- 변경 요약:
-- ✅ Orders SELECT: 본인 주문만 OR admin 전체
-- ✅ Orders UPDATE: admin만 (일반 유저 차단)
-- ✅ Order Items SELECT: 본인 주문 아이템만 OR admin 전체
-- ✅ Storage WRITE: admin만
--
-- ⚠️ 실행 후 확인:
-- 1. 관리자 계정으로 /admin/orders 접속 → 주문 목록 정상 표시
-- 2. 일반 계정으로 /account → 본인 주문만 표시
-- 3. 일반 계정으로 /admin/orders → 빈 목록 또는 접근 불가
