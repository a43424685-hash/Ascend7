-- 소재 구성 및 세탁 안내 구조화 컬럼 추가
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS material TEXT,
  ADD COLUMN IF NOT EXISTS care_instructions TEXT[];
