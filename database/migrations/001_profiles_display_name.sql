-- =====================================================
-- Migration 001: profiles 테이블 display_name 추가
-- 실행 순서: 1번째
-- =====================================================

-- 1. display_name 컬럼 추가 (기존 name 대체)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. 기존 name 데이터가 있으면 display_name으로 복사
UPDATE profiles SET display_name = name WHERE name IS NOT NULL AND display_name IS NULL;

-- 3. phone 컬럼도 추가 (없으면)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 4. 사용자가 자신의 프로필을 수정할 수 있도록 UPDATE 정책
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 완료!
