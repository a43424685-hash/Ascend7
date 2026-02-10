-- =====================================================
-- 관리자 주문 관리 시스템 DB 스키마 확장
-- =====================================================

-- 1. profiles 테이블 생성 (사용자 role 관리)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- profiles 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2. orders 테이블 확장 (배송/운영 컬럼 추가)
-- =====================================================

-- 기존 status 컬럼을 payment_status로 변경
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE orders RENAME COLUMN status TO payment_status;
  END IF;
END $$;

-- fulfillment_status 컬럼 추가
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled' 
CHECK (fulfillment_status IN ('unfulfilled', 'processing', 'shipped', 'delivered', 'canceled'));

-- 배송/고객 정보 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- 인덱스 추가 (운영 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON orders(created_at DESC);

-- 3. RLS 정책 설정 (admin role 기반)
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "admin_read_orders" ON orders;
DROP POLICY IF EXISTS "admin_update_orders" ON orders;

-- orders 테이블 RLS 활성화
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 관리자: 모든 주문 조회 가능
CREATE POLICY "admin_read_all_orders" ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 관리자: 배송 상태 업데이트 가능
CREATE POLICY "admin_update_order_fulfillment" ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 일반 사용자: 자기 주문만 조회 가능
CREATE POLICY "users_read_own_orders" ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 게스트 주문: 이메일 기반 조회 (향후 주문 조회 기능용)
-- 현재는 보안상 비활성화 (관리자만 볼 수 있음)

-- 4. profiles 테이블 RLS 정책
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 자기 프로필은 조회 가능
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 관리자: 모든 프로필 조회 가능
CREATE POLICY "admin_read_all_profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- 프로필 자동 생성 트리거 (신규 사용자 가입 시)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. order_items RLS 정책 (관리자용)
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;

-- 관리자: 모든 주문 아이템 조회 가능
CREATE POLICY "admin_read_all_order_items" ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 일반 사용자: 자기 주문의 아이템만 조회
CREATE POLICY "users_read_own_order_items" ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- 6. 관리자 계정 생성 헬퍼 함수
-- =====================================================

-- 관리자 role 변경 함수 (Supabase Dashboard SQL Editor에서 수동 실행용)
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- 이메일로 사용자 찾기
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN '사용자를 찾을 수 없습니다: ' || user_email;
  END IF;
  
  -- profiles에 레코드가 없으면 생성
  INSERT INTO profiles (id, email, role)
  VALUES (user_id, user_email, 'admin')
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin', updated_at = NOW();
  
  RETURN '관리자 권한 부여 완료: ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 적용 완료 메시지
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 관리자 주문 관리 시스템 DB 설정 완료!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 다음 단계:';
  RAISE NOTICE '1. 관리자 계정 생성: SELECT make_user_admin(''your-email@example.com'');';
  RAISE NOTICE '2. Webhook 코드 업데이트 (shipping/customer 정보 저장)';
  RAISE NOTICE '3. Admin Orders UI 구현';
END $$;

