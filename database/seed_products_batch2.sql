-- ================================================================
-- ITERO7 추가 상품 시드 데이터 (카테고리별 3개씩)
-- Supabase Dashboard > SQL Editor 에서 실행
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- OUTER (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-wind-shield-jacket', 'WIND SHIELD JACKET', '초경량 방풍 재킷. 접어서 주머니에 넣을 수 있는 팩커블 디자인으로 야외 러닝에 최적입니다.', 'outer', NULL, true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', 0 FROM products WHERE slug = 'itero7-wind-shield-jacket';
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?w=800&q=80', 1 FROM products WHERE slug = 'itero7-wind-shield-jacket';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'WJ002-BLK-S', 'BLACK', 'S', 95000, 10, true FROM products WHERE slug = 'itero7-wind-shield-jacket';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'WJ002-BLK-M', 'BLACK', 'M', 95000, 15, true FROM products WHERE slug = 'itero7-wind-shield-jacket';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'WJ002-BLK-L', 'BLACK', 'L', 95000, 12, true FROM products WHERE slug = 'itero7-wind-shield-jacket';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'WJ002-BLK-XL', 'BLACK', 'XL', 95000, 8, true FROM products WHERE slug = 'itero7-wind-shield-jacket';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-fleece-zip-up', 'FLEECE ZIP-UP', '보온성과 통기성을 겸비한 플리스 집업. 실내 운동 전후 워밍업 레이어로 활용도 높습니다.', 'outer', NULL, true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', 0 FROM products WHERE slug = 'itero7-fleece-zip-up';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'FZ002-GRY-S', 'GRAY', 'S', 85000, 8, true FROM products WHERE slug = 'itero7-fleece-zip-up';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'FZ002-GRY-M', 'GRAY', 'M', 85000, 12, true FROM products WHERE slug = 'itero7-fleece-zip-up';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'FZ002-GRY-L', 'GRAY', 'L', 85000, 10, true FROM products WHERE slug = 'itero7-fleece-zip-up';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'FZ002-GRY-XL', 'GRAY', 'XL', 85000, 5, true FROM products WHERE slug = 'itero7-fleece-zip-up';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-track-jacket', 'TRACK JACKET', '레트로 감성의 트랙 재킷. 사이드 라인 디테일과 스탠드 칼라로 스포티한 무드를 연출합니다.', 'outer', NULL, true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1544923246-77307dd270f8?w=800&q=80', 0 FROM products WHERE slug = 'itero7-track-jacket';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TK002-NVY-S', 'NAVY', 'S', 79000, 10, true FROM products WHERE slug = 'itero7-track-jacket';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TK002-NVY-M', 'NAVY', 'M', 79000, 14, true FROM products WHERE slug = 'itero7-track-jacket';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TK002-NVY-L', 'NAVY', 'L', 79000, 10, true FROM products WHERE slug = 'itero7-track-jacket';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TK002-NVY-XL', 'NAVY', 'XL', 79000, 6, true FROM products WHERE slug = 'itero7-track-jacket';

-- ════════════════════════════════════════════════════════════════
-- TOP > HOODIE (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-oversized-hoodie', 'OVERSIZED HOODIE', '릴렉스핏 오버사이즈 후디. 두꺼운 헤비웨이트 원단으로 존재감 있는 실루엣을 만들어 줍니다.', 'top', 'hoodie', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80', 0 FROM products WHERE slug = 'itero7-oversized-hoodie';
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80', 1 FROM products WHERE slug = 'itero7-oversized-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'OH002-BLK-M', 'BLACK', 'M', 85000, 15, true FROM products WHERE slug = 'itero7-oversized-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'OH002-BLK-L', 'BLACK', 'L', 85000, 15, true FROM products WHERE slug = 'itero7-oversized-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'OH002-BLK-XL', 'BLACK', 'XL', 85000, 10, true FROM products WHERE slug = 'itero7-oversized-hoodie';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-zip-hoodie', 'ZIP-UP HOODIE', '풀지퍼 후디. 운동 전후 체온 조절에 용이하며, 캥거루 포켓으로 소지품 보관이 편리합니다.', 'top', 'hoodie', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=800&q=80', 0 FROM products WHERE slug = 'itero7-zip-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'ZH002-CHR-S', 'CHARCOAL', 'S', 82000, 10, true FROM products WHERE slug = 'itero7-zip-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'ZH002-CHR-M', 'CHARCOAL', 'M', 82000, 14, true FROM products WHERE slug = 'itero7-zip-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'ZH002-CHR-L', 'CHARCOAL', 'L', 82000, 12, true FROM products WHERE slug = 'itero7-zip-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'ZH002-CHR-XL', 'CHARCOAL', 'XL', 82000, 6, true FROM products WHERE slug = 'itero7-zip-hoodie';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-cropped-hoodie', 'CROPPED HOODIE', '크롭 기장의 후디. 하이웨이스트 팬츠와 매치하면 깔끔한 핏을 연출할 수 있습니다.', 'top', 'hoodie', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', 0 FROM products WHERE slug = 'itero7-cropped-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CH002-BLK-S', 'BLACK', 'S', 72000, 12, true FROM products WHERE slug = 'itero7-cropped-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CH002-BLK-M', 'BLACK', 'M', 72000, 15, true FROM products WHERE slug = 'itero7-cropped-hoodie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CH002-BLK-L', 'BLACK', 'L', 72000, 10, true FROM products WHERE slug = 'itero7-cropped-hoodie';

-- ════════════════════════════════════════════════════════════════
-- TOP > SWEATER (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-heavy-crewneck', 'HEAVY CREWNECK', '460g 헤비웨이트 크루넥 맨투맨. 두꺼운 원단과 넉넉한 핏으로 가을/겨울 데일리 아이템입니다.', 'top', 'sweater', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', 0 FROM products WHERE slug = 'itero7-heavy-crewneck';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'HC002-BLK-S', 'BLACK', 'S', 69000, 10, true FROM products WHERE slug = 'itero7-heavy-crewneck';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'HC002-BLK-M', 'BLACK', 'M', 69000, 15, true FROM products WHERE slug = 'itero7-heavy-crewneck';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'HC002-BLK-L', 'BLACK', 'L', 69000, 12, true FROM products WHERE slug = 'itero7-heavy-crewneck';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'HC002-BLK-XL', 'BLACK', 'XL', 69000, 8, true FROM products WHERE slug = 'itero7-heavy-crewneck';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-raglan-sweatshirt', 'RAGLAN SWEATSHIRT', '레글런 소매 맨투맨. 어깨 라인이 자연스러워 운동 시 팔 가동 범위가 넓습니다.', 'top', 'sweater', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80', 0 FROM products WHERE slug = 'itero7-raglan-sweatshirt';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'RS002-GRY-S', 'GRAY', 'S', 62000, 10, true FROM products WHERE slug = 'itero7-raglan-sweatshirt';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'RS002-GRY-M', 'GRAY', 'M', 62000, 14, true FROM products WHERE slug = 'itero7-raglan-sweatshirt';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'RS002-GRY-L', 'GRAY', 'L', 62000, 12, true FROM products WHERE slug = 'itero7-raglan-sweatshirt';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'RS002-GRY-XL', 'GRAY', 'XL', 62000, 6, true FROM products WHERE slug = 'itero7-raglan-sweatshirt';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-pigment-sweatshirt', 'PIGMENT SWEATSHIRT', '피그먼트 워싱 맨투맨. 빈티지한 색감과 부드러운 촉감이 특징입니다.', 'top', 'sweater', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', 0 FROM products WHERE slug = 'itero7-pigment-sweatshirt';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'PS002-CHL-S', 'CHARCOAL', 'S', 59000, 10, true FROM products WHERE slug = 'itero7-pigment-sweatshirt';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'PS002-CHL-M', 'CHARCOAL', 'M', 59000, 14, true FROM products WHERE slug = 'itero7-pigment-sweatshirt';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'PS002-CHL-L', 'CHARCOAL', 'L', 59000, 12, true FROM products WHERE slug = 'itero7-pigment-sweatshirt';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'PS002-CHL-XL', 'CHARCOAL', 'XL', 59000, 5, true FROM products WHERE slug = 'itero7-pigment-sweatshirt';

-- ════════════════════════════════════════════════════════════════
-- TOP > T-SHIRTS (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-muscle-fit-tee', 'MUSCLE FIT TEE', '슬림핏 머슬 티셔츠. 몸의 라인을 살려주는 핏으로 운동 효과를 극대화합니다.', 'top', 'tshirts', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', 0 FROM products WHERE slug = 'itero7-muscle-fit-tee';
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80', 1 FROM products WHERE slug = 'itero7-muscle-fit-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'MF002-BLK-S', 'BLACK', 'S', 42000, 15, true FROM products WHERE slug = 'itero7-muscle-fit-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'MF002-BLK-M', 'BLACK', 'M', 42000, 20, true FROM products WHERE slug = 'itero7-muscle-fit-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'MF002-BLK-L', 'BLACK', 'L', 42000, 18, true FROM products WHERE slug = 'itero7-muscle-fit-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'MF002-BLK-XL', 'BLACK', 'XL', 42000, 10, true FROM products WHERE slug = 'itero7-muscle-fit-tee';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-graphic-tee', 'GRAPHIC TEE', '모티베이션 그래픽 프린트 반팔 티. "NEVER STOP" 레터링으로 의지를 불태워 보세요.', 'top', 'tshirts', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80', 0 FROM products WHERE slug = 'itero7-graphic-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'GT002-WHT-S', 'WHITE', 'S', 45000, 12, true FROM products WHERE slug = 'itero7-graphic-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'GT002-WHT-M', 'WHITE', 'M', 45000, 18, true FROM products WHERE slug = 'itero7-graphic-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'GT002-WHT-L', 'WHITE', 'L', 45000, 15, true FROM products WHERE slug = 'itero7-graphic-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'GT002-WHT-XL', 'WHITE', 'XL', 45000, 8, true FROM products WHERE slug = 'itero7-graphic-tee';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-dry-fit-tee', 'DRY-FIT TEE', '드라이핏 기능성 반팔. 4방향 스트레치와 빠른 건조 기능으로 고강도 운동에 최적입니다.', 'top', 'tshirts', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80', 0 FROM products WHERE slug = 'itero7-dry-fit-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'DF002-NVY-S', 'NAVY', 'S', 38000, 18, true FROM products WHERE slug = 'itero7-dry-fit-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'DF002-NVY-M', 'NAVY', 'M', 38000, 22, true FROM products WHERE slug = 'itero7-dry-fit-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'DF002-NVY-L', 'NAVY', 'L', 38000, 18, true FROM products WHERE slug = 'itero7-dry-fit-tee';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'DF002-NVY-XL', 'NAVY', 'XL', 38000, 10, true FROM products WHERE slug = 'itero7-dry-fit-tee';

-- ════════════════════════════════════════════════════════════════
-- TOP > LONG SLEEVE (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-compression-ls', 'COMPRESSION LONG SLEEVE', '컴프레션 긴팔 상의. 근육을 잡아주는 압박 핏으로 퍼포먼스 향상에 도움을 줍니다.', 'top', 'longsleeve', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=800&q=80', 0 FROM products WHERE slug = 'itero7-compression-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CL002-BLK-S', 'BLACK', 'S', 52000, 12, true FROM products WHERE slug = 'itero7-compression-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CL002-BLK-M', 'BLACK', 'M', 52000, 18, true FROM products WHERE slug = 'itero7-compression-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CL002-BLK-L', 'BLACK', 'L', 52000, 14, true FROM products WHERE slug = 'itero7-compression-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CL002-BLK-XL', 'BLACK', 'XL', 52000, 8, true FROM products WHERE slug = 'itero7-compression-ls';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-thermal-ls', 'THERMAL LONG SLEEVE', '기모 안감 긴팔. 겨울 야외 운동에도 체온을 유지해 주는 보온 기능성 상의입니다.', 'top', 'longsleeve', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', 0 FROM products WHERE slug = 'itero7-thermal-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TL002-GRY-S', 'GRAY', 'S', 55000, 10, true FROM products WHERE slug = 'itero7-thermal-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TL002-GRY-M', 'GRAY', 'M', 55000, 14, true FROM products WHERE slug = 'itero7-thermal-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TL002-GRY-L', 'GRAY', 'L', 55000, 12, true FROM products WHERE slug = 'itero7-thermal-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TL002-GRY-XL', 'GRAY', 'XL', 55000, 6, true FROM products WHERE slug = 'itero7-thermal-ls';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-henley-ls', 'HENLEY LONG SLEEVE', '헨리넥 긴팔 상의. 버튼 디테일이 캐주얼하면서도 운동할 때 답답하지 않은 핏입니다.', 'top', 'longsleeve', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 0 FROM products WHERE slug = 'itero7-henley-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'HL002-WHT-S', 'WHITE', 'S', 48000, 10, true FROM products WHERE slug = 'itero7-henley-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'HL002-WHT-M', 'WHITE', 'M', 48000, 14, true FROM products WHERE slug = 'itero7-henley-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'HL002-WHT-L', 'WHITE', 'L', 48000, 12, true FROM products WHERE slug = 'itero7-henley-ls';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'HL002-WHT-XL', 'WHITE', 'XL', 48000, 6, true FROM products WHERE slug = 'itero7-henley-ls';

-- ════════════════════════════════════════════════════════════════
-- TOP > SLEEVELESS (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-cut-off-tank', 'CUT-OFF TANK', '사이드 컷 디자인의 탱크탑. 팔과 어깨의 가동 범위를 최대화해 웨이트 트레이닝에 최적입니다.', 'top', 'sleeveless', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', 0 FROM products WHERE slug = 'itero7-cut-off-tank';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CT002-BLK-S', 'BLACK', 'S', 32000, 15, true FROM products WHERE slug = 'itero7-cut-off-tank';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CT002-BLK-M', 'BLACK', 'M', 32000, 20, true FROM products WHERE slug = 'itero7-cut-off-tank';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CT002-BLK-L', 'BLACK', 'L', 32000, 15, true FROM products WHERE slug = 'itero7-cut-off-tank';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CT002-BLK-XL', 'BLACK', 'XL', 32000, 8, true FROM products WHERE slug = 'itero7-cut-off-tank';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-stringer-tank', 'STRINGER TANK', '스트링거 탱크탑. 넓은 암홀과 레이서백 디자인으로 상체 근육을 돋보이게 합니다.', 'top', 'sleeveless', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', 0 FROM products WHERE slug = 'itero7-stringer-tank';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'ST002-WHT-S', 'WHITE', 'S', 29000, 18, true FROM products WHERE slug = 'itero7-stringer-tank';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'ST002-WHT-M', 'WHITE', 'M', 29000, 22, true FROM products WHERE slug = 'itero7-stringer-tank';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'ST002-WHT-L', 'WHITE', 'L', 29000, 15, true FROM products WHERE slug = 'itero7-stringer-tank';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'ST002-WHT-XL', 'WHITE', 'XL', 29000, 8, true FROM products WHERE slug = 'itero7-stringer-tank';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-performance-vest', 'PERFORMANCE VEST', '메시 패널이 적용된 퍼포먼스 조끼. 통기성이 뛰어나 유산소 운동에 적합합니다.', 'top', 'sleeveless', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80', 0 FROM products WHERE slug = 'itero7-performance-vest';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'PV002-BLK-S', 'BLACK', 'S', 38000, 12, true FROM products WHERE slug = 'itero7-performance-vest';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'PV002-BLK-M', 'BLACK', 'M', 38000, 18, true FROM products WHERE slug = 'itero7-performance-vest';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'PV002-BLK-L', 'BLACK', 'L', 38000, 14, true FROM products WHERE slug = 'itero7-performance-vest';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'PV002-BLK-XL', 'BLACK', 'XL', 38000, 6, true FROM products WHERE slug = 'itero7-performance-vest';

-- ════════════════════════════════════════════════════════════════
-- BOTTOM > SHORTS (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-5inch-shorts', '5INCH SHORTS', '5인치 기장의 짧은 트레이닝 숏팬츠. 레그프레스, 스쿼트 시 허벅지 가동에 방해가 없습니다.', 'bottom', 'shorts', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1562886877-aaaa5c07c0c0?w=800&q=80', 0 FROM products WHERE slug = 'itero7-5inch-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, '5S002-BLK-S', 'BLACK', 'S', 45000, 15, true FROM products WHERE slug = 'itero7-5inch-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, '5S002-BLK-M', 'BLACK', 'M', 45000, 20, true FROM products WHERE slug = 'itero7-5inch-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, '5S002-BLK-L', 'BLACK', 'L', 45000, 15, true FROM products WHERE slug = 'itero7-5inch-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, '5S002-BLK-XL', 'BLACK', 'XL', 45000, 8, true FROM products WHERE slug = 'itero7-5inch-shorts';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-2in1-shorts', '2-IN-1 SHORTS', '이너 레깅스가 내장된 2-in-1 반바지. 별도의 속바지 없이 편하게 운동할 수 있습니다.', 'bottom', 'shorts', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b2?w=800&q=80', 0 FROM products WHERE slug = 'itero7-2in1-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, '2N002-GRY-S', 'GRAY', 'S', 55000, 12, true FROM products WHERE slug = 'itero7-2in1-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, '2N002-GRY-M', 'GRAY', 'M', 55000, 16, true FROM products WHERE slug = 'itero7-2in1-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, '2N002-GRY-L', 'GRAY', 'L', 55000, 12, true FROM products WHERE slug = 'itero7-2in1-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, '2N002-GRY-XL', 'GRAY', 'XL', 55000, 6, true FROM products WHERE slug = 'itero7-2in1-shorts';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-sweat-shorts', 'SWEAT SHORTS', '스웻 소재 반바지. 부드러운 코튼 블렌드로 운동은 물론 일상에서도 편하게 입을 수 있습니다.', 'bottom', 'shorts', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1592578630216-de7b4b7ee898?w=800&q=80', 0 FROM products WHERE slug = 'itero7-sweat-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'SS002-BLK-S', 'BLACK', 'S', 42000, 14, true FROM products WHERE slug = 'itero7-sweat-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'SS002-BLK-M', 'BLACK', 'M', 42000, 18, true FROM products WHERE slug = 'itero7-sweat-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'SS002-BLK-L', 'BLACK', 'L', 42000, 14, true FROM products WHERE slug = 'itero7-sweat-shorts';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'SS002-BLK-XL', 'BLACK', 'XL', 42000, 8, true FROM products WHERE slug = 'itero7-sweat-shorts';

-- ════════════════════════════════════════════════════════════════
-- BOTTOM > PANTS (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-cargo-pants', 'CARGO PANTS', '사이드 포켓이 달린 카고 트레이닝 팬츠. 실용적이면서 스트릿 감성도 갖추고 있습니다.', 'bottom', 'pants', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80', 0 FROM products WHERE slug = 'itero7-cargo-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CP002-BLK-S', 'BLACK', 'S', 72000, 10, true FROM products WHERE slug = 'itero7-cargo-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CP002-BLK-M', 'BLACK', 'M', 72000, 14, true FROM products WHERE slug = 'itero7-cargo-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CP002-BLK-L', 'BLACK', 'L', 72000, 12, true FROM products WHERE slug = 'itero7-cargo-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CP002-BLK-XL', 'BLACK', 'XL', 72000, 6, true FROM products WHERE slug = 'itero7-cargo-pants';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-tapered-pants', 'TAPERED PANTS', '테이퍼드 핏 트레이닝 팬츠. 허벅지는 여유 있고 아래로 갈수록 좁아지는 세련된 실루엣입니다.', 'bottom', 'pants', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80', 0 FROM products WHERE slug = 'itero7-tapered-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TP002-CHR-S', 'CHARCOAL', 'S', 68000, 10, true FROM products WHERE slug = 'itero7-tapered-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TP002-CHR-M', 'CHARCOAL', 'M', 68000, 14, true FROM products WHERE slug = 'itero7-tapered-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TP002-CHR-L', 'CHARCOAL', 'L', 68000, 12, true FROM products WHERE slug = 'itero7-tapered-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'TP002-CHR-XL', 'CHARCOAL', 'XL', 68000, 6, true FROM products WHERE slug = 'itero7-tapered-pants';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-wide-pants', 'WIDE TRAINING PANTS', '와이드 핏 트레이닝 팬츠. 넉넉한 통으로 스트레칭이나 요가 등 유연성 운동에 적합합니다.', 'bottom', 'pants', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80', 0 FROM products WHERE slug = 'itero7-wide-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'WP002-BLK-S', 'BLACK', 'S', 62000, 10, true FROM products WHERE slug = 'itero7-wide-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'WP002-BLK-M', 'BLACK', 'M', 62000, 14, true FROM products WHERE slug = 'itero7-wide-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'WP002-BLK-L', 'BLACK', 'L', 62000, 12, true FROM products WHERE slug = 'itero7-wide-pants';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'WP002-BLK-XL', 'BLACK', 'XL', 62000, 6, true FROM products WHERE slug = 'itero7-wide-pants';

-- ════════════════════════════════════════════════════════════════
-- ACCESSORIES > CAP (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-mesh-cap', 'MESH CAP', '메시 소재 트러커 캡. 통기성이 뛰어나 야외 운동 시에도 쾌적합니다.', 'accessories', 'cap', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&q=80', 0 FROM products WHERE slug = 'itero7-mesh-cap';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'MC002-BLK-FREE', 'BLACK', 'FREE', 35000, 25, true FROM products WHERE slug = 'itero7-mesh-cap';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'MC002-WHT-FREE', 'WHITE', 'FREE', 35000, 20, true FROM products WHERE slug = 'itero7-mesh-cap';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-beanie', 'TRAINING BEANIE', '겨울 운동을 위한 트레이닝 비니. 흡습 속건 기능으로 땀이 나도 쾌적합니다.', 'accessories', 'cap', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80', 0 FROM products WHERE slug = 'itero7-beanie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'BN002-BLK-FREE', 'BLACK', 'FREE', 28000, 30, true FROM products WHERE slug = 'itero7-beanie';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'BN002-GRY-FREE', 'GRAY', 'FREE', 28000, 20, true FROM products WHERE slug = 'itero7-beanie';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-bucket-hat', 'BUCKET HAT', '스포츠 버킷햇. 넓은 챙으로 자외선을 차단하며, 접이식으로 휴대가 간편합니다.', 'accessories', 'cap', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80', 0 FROM products WHERE slug = 'itero7-bucket-hat';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'BH002-BLK-FREE', 'BLACK', 'FREE', 32000, 20, true FROM products WHERE slug = 'itero7-bucket-hat';

-- ════════════════════════════════════════════════════════════════
-- ACCESSORIES > SOCKS (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-ankle-socks', 'ANKLE SOCKS (3-PACK)', '발목 기장 트레이닝 양말 3켤레 세트. 운동화 안에서 미끄러지지 않는 실리콘 그립 적용.', 'accessories', 'socks', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80', 0 FROM products WHERE slug = 'itero7-ankle-socks';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'AS002-BLK-M', 'BLACK', 'M (260-275)', 19000, 30, true FROM products WHERE slug = 'itero7-ankle-socks';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'AS002-BLK-L', 'BLACK', 'L (275-290)', 19000, 25, true FROM products WHERE slug = 'itero7-ankle-socks';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-crew-socks', 'CREW SOCKS (3-PACK)', '중목 기장 트레이닝 양말 3켤레 세트. 아킬레스건 보호 쿠셔닝이 적용되어 있습니다.', 'accessories', 'socks', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', 0 FROM products WHERE slug = 'itero7-crew-socks';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CS002-WHT-M', 'WHITE', 'M (260-275)', 22000, 25, true FROM products WHERE slug = 'itero7-crew-socks';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CS002-WHT-L', 'WHITE', 'L (275-290)', 22000, 20, true FROM products WHERE slug = 'itero7-crew-socks';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-compression-socks', 'COMPRESSION SOCKS', '종아리 압박 기능 양말. 장시간 운동 후 피로 회복을 도와줍니다.', 'accessories', 'socks', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1631038276992-1f66c78e7c82?w=800&q=80', 0 FROM products WHERE slug = 'itero7-compression-socks';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CK002-BLK-M', 'BLACK', 'M (260-275)', 25000, 20, true FROM products WHERE slug = 'itero7-compression-socks';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'CK002-BLK-L', 'BLACK', 'L (275-290)', 25000, 18, true FROM products WHERE slug = 'itero7-compression-socks';

-- ════════════════════════════════════════════════════════════════
-- ACCESSORIES > BAG (3개)
-- ════════════════════════════════════════════════════════════════

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-backpack', 'TRAINING BACKPACK', '대용량 트레이닝 백팩. 노트북 수납 포켓과 신발 분리 수납칸이 있어 출퇴근+운동에 완벽합니다.', 'accessories', 'bag', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80', 0 FROM products WHERE slug = 'itero7-backpack';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'BP002-BLK-FREE', 'BLACK', 'FREE', 75000, 15, true FROM products WHERE slug = 'itero7-backpack';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-sling-bag', 'SLING BAG', '컴팩트 슬링백. 스마트폰, 지갑, 이어폰 등 최소 소지품만 들고 짐에 갈 때 딱입니다.', 'accessories', 'bag', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80', 0 FROM products WHERE slug = 'itero7-sling-bag';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'SB002-BLK-FREE', 'BLACK', 'FREE', 39000, 20, true FROM products WHERE slug = 'itero7-sling-bag';

INSERT INTO products (slug, name, description, category, sub_category, is_active) VALUES
('itero7-duffle-bag', 'DUFFLE BAG', '대용량 더플백. 방수 코팅 원단으로 비 오는 날에도 걱정 없이 운동 가방으로 사용 가능합니다.', 'accessories', 'bag', true);
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1585916420730-d7f95e942d43?w=800&q=80', 0 FROM products WHERE slug = 'itero7-duffle-bag';
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT id, 'DB002-NVY-FREE', 'NAVY', 'FREE', 65000, 15, true FROM products WHERE slug = 'itero7-duffle-bag';
