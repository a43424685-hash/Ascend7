-- 생일 적립금 중복 지급 방지 unique index
-- point_transactions 테이블에서 '생일 축하 3000P (YYYY년)' description은
-- 동일 user_id에 대해 연 1회만 허용

CREATE UNIQUE INDEX IF NOT EXISTS idx_birthday_points_no_duplicate
  ON point_transactions (user_id, description)
  WHERE description LIKE '생일 축하 3000P%';
