-- 017: 상품별 사이즈/소재/세탁 안내 + 전역 배송 정책

-- 상품 테이블에 사이즈/소재/세탁 안내 컬럼 추가
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS size_material_care TEXT;

-- site_settings에 배송 정책 기본값 추가 (value 컬럼은 JSONB이므로 문자열을 JSON으로 감쌈)
INSERT INTO site_settings (key, value)
VALUES ('shipping_policy', to_json('택배 배송 (CJ대한통운)
배송비: 3,000원 (50,000원 이상 무료배송)
출고: 결제 완료 후 1~3 영업일 이내

교환: 상품 수령 후 7일 이내
반품: 상품 수령 후 7일 이내
반품 배송비: 고객 변심 왕복 6,000원 / 불량 무료
환불: 반품 수령 후 3~5 영업일

* 착용 흔적, 택(Tag) 제거, 세탁/수선한 경우 교환·반품 불가'::TEXT)::JSONB)
ON CONFLICT (key) DO NOTHING;
