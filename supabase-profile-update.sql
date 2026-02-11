-- =====================================================
-- 프로필 수정 기능 추가
-- =====================================================
-- Supabase SQL Editor에서 실행하세요.

-- 1. profiles 테이블에 name, phone 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. 사용자가 자신의 프로필을 수정할 수 있도록 UPDATE 정책 추가
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 완료!
-- 이제 사용자가 자신의 이름과 전화번호를 수정할 수 있습니다.
