-- 017: 상품별 사이즈/소재/세탁 안내 + 전역 배송 정책

-- 상품 테이블에 사이즈/소재/세탁 안내 컬럼 추가
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS size_material_care TEXT;

-- shipping_policy는 어드민 사이트 설정 페이지에서 처음 저장 시 자동 생성됩니다.
-- (코드 기본값이 DEFAULTS에 정의되어 있으므로 별도 INSERT 불필요)
