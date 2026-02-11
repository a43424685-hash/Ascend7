-- =====================================================
-- Migration 002: products/variants/images admin 전용 RLS
-- 실행 순서: 2번째
-- =====================================================

-- is_admin 함수가 없으면 생성 (SECURITY DEFINER로 RLS 우회)
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
-- Products: admin만 수정 가능
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "auth_insert_products" ON products;
DROP POLICY IF EXISTS "auth_update_products" ON products;
DROP POLICY IF EXISTS "auth_delete_products" ON products;

-- admin 전용 정책
CREATE POLICY "admin_insert_products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "admin_update_products" ON products
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "admin_delete_products" ON products
  FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- Product Images: admin만 수정 가능
-- =====================================================

DROP POLICY IF EXISTS "auth_insert_product_images" ON product_images;
DROP POLICY IF EXISTS "auth_update_product_images" ON product_images;
DROP POLICY IF EXISTS "auth_delete_product_images" ON product_images;

CREATE POLICY "admin_insert_product_images" ON product_images
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "admin_update_product_images" ON product_images
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "admin_delete_product_images" ON product_images
  FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- Variants: admin만 수정 가능
-- =====================================================

DROP POLICY IF EXISTS "auth_insert_variants" ON variants;
DROP POLICY IF EXISTS "auth_update_variants" ON variants;
DROP POLICY IF EXISTS "auth_delete_variants" ON variants;

CREATE POLICY "admin_insert_variants" ON variants
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "admin_update_variants" ON variants
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "admin_delete_variants" ON variants
  FOR DELETE TO authenticated
  USING (is_admin());

-- 완료!
-- 이제 products/images/variants는 admin 역할만 수정할 수 있습니다.
