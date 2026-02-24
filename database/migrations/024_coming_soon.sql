-- 024_coming_soon.sql
-- products 테이블에 준비중(coming soon) 컬럼 추가

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_coming_soon boolean DEFAULT false;

COMMENT ON COLUMN products.is_coming_soon IS '준비중 여부: true면 고객 화면에 Coming Soon 오버레이 표시';
