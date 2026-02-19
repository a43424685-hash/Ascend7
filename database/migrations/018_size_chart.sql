-- 018: 상품별 사이즈 차트 컬럼 추가
-- 형식: 첫 줄=헤더, 이후=행 (|로 구분)
-- 예: 사이즈|총장|어깨|가슴|소매
--     S|67|44|104|62

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS size_chart TEXT;
