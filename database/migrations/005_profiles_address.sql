-- =====================================================
-- 005: profiles 기본 배송지 필드 + orders 전화번호 필드 추가
-- =====================================================

-- profiles: 기본 배송지 정보
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_address_detail TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_postal_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_memo TEXT;

-- orders: 고객 전화번호 필드 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 인덱스 (필요시)
-- CREATE INDEX IF NOT EXISTS idx_profiles_postal_code ON profiles(default_postal_code);

-- 사용자 본인 프로필 업데이트 허용 (RLS)
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 재고 복구 함수 (환불 시 사용)
CREATE OR REPLACE FUNCTION atomic_restore_stock(p_variant_id UUID, p_quantity INT)
RETURNS TABLE(success BOOLEAN, new_stock INT, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE variants
  SET stock = stock + p_quantity
  WHERE id = p_variant_id;

  RETURN QUERY
  SELECT
    TRUE::BOOLEAN AS success,
    (SELECT stock FROM variants WHERE id = p_variant_id)::INT AS new_stock,
    NULL::TEXT AS error_message;
END;
$$;
