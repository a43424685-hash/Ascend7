-- 상품 서브카테고리 컬럼 추가
ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- 인덱스 추가 (카테고리 + 서브카테고리 조합 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_products_category_sub ON products(category, sub_category);
