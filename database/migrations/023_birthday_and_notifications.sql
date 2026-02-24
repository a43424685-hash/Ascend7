-- profiles 테이블에 birthday 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthday DATE;

-- 생일 쿠폰 중복 지급 방지용 인덱스 (point_transactions의 type + description으로 체크)
-- point_transactions 테이블은 이미 존재함 (earn/spend type 사용 중)
-- birthday_coupon은 type='earn', description='생일 축하 3000P (YYYY년)' 패턴으로 식별
