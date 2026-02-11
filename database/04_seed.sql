-- ASCEND7 시드 데이터
-- 최소 3개 상품 + variants + 이미지

-- ============================================
-- 1. Premium Tank Top
-- ============================================
INSERT INTO products (slug, name, description, category, is_active) VALUES
('premium-tank-top', 'Premium Tank Top', '고성능 운동을 위한 프리미엄 탱크톱. 통기성과 스타일을 겸비한 최고의 선택.', 'top', true);

-- Product 1 이미지 (플레이스홀더 - 실제 이미지 URL로 교체 필요)
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 0
FROM products WHERE slug = 'premium-tank-top';

INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 1
FROM products WHERE slug = 'premium-tank-top';

-- Product 1 Variants
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'TANK-BLACK-S',
  'Black',
  'S',
  49000,
  15,
  true
FROM products WHERE slug = 'premium-tank-top';

INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'TANK-BLACK-M',
  'Black',
  'M',
  49000,
  20,
  true
FROM products WHERE slug = 'premium-tank-top';

INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'TANK-BLACK-L',
  'Black',
  'L',
  49000,
  18,
  true
FROM products WHERE slug = 'premium-tank-top';

INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'TANK-GRAY-M',
  'Gray',
  'M',
  49000,
  12,
  true
FROM products WHERE slug = 'premium-tank-top';

INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'TANK-GRAY-L',
  'Gray',
  'L',
  49000,
  10,
  true
FROM products WHERE slug = 'premium-tank-top';

-- ============================================
-- 2. Athletic Performance Shorts
-- ============================================
INSERT INTO products (slug, name, description, category, is_active) VALUES
('athletic-shorts', 'Athletic Performance Shorts', '강도 높은 트레이닝을 위한 프리미엄 반바지. 뛰어난 움직임과 편안함을 제공합니다.', 'bottom', true);

-- Product 2 이미지
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 0
FROM products WHERE slug = 'athletic-shorts';

INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800', 1
FROM products WHERE slug = 'athletic-shorts';

-- Product 2 Variants
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'SHORTS-BLACK-S',
  'Black',
  'S',
  69000,
  8,
  true
FROM products WHERE slug = 'athletic-shorts';

INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'SHORTS-BLACK-M',
  'Black',
  'M',
  69000,
  15,
  true
FROM products WHERE slug = 'athletic-shorts';

INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'SHORTS-BLACK-L',
  'Black',
  'L',
  69000,
  12,
  true
FROM products WHERE slug = 'athletic-shorts';

INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'SHORTS-NAVY-M',
  'Navy',
  'M',
  69000,
  10,
  true
FROM products WHERE slug = 'athletic-shorts';

INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'SHORTS-NAVY-L',
  'Navy',
  'L',
  69000,
  9,
  true
FROM products WHERE slug = 'athletic-shorts';

-- ============================================
-- 3. Training Gloves
-- ============================================
INSERT INTO products (slug, name, description, category, is_active) VALUES
('training-gloves', 'Training Gloves', '강력한 그립과 손목 보호를 제공하는 프리미엄 트레이닝 장갑.', 'accessories', true);

-- Product 3 이미지
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 0
FROM products WHERE slug = 'training-gloves';

INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800', 1
FROM products WHERE slug = 'training-gloves';

-- Product 3 Variants
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'GLOVES-BLACK-ONE',
  'Black',
  'One Size',
  39000,
  25,
  true
FROM products WHERE slug = 'training-gloves';

INSERT INTO variants (product_id, sku, color, size, price, stock, is_active)
SELECT 
  id,
  'GLOVES-RED-ONE',
  'Red',
  'One Size',
  39000,
  20,
  true
FROM products WHERE slug = 'training-gloves';

-- ============================================
-- 확인 쿼리 (실행 후 결과 확인)
-- ============================================
-- SELECT 
--   p.name,
--   p.category,
--   COUNT(DISTINCT v.id) as variant_count,
--   MIN(v.price) as min_price,
--   MAX(v.price) as max_price,
--   SUM(v.stock) as total_stock,
--   COUNT(DISTINCT pi.id) as image_count
-- FROM products p
-- LEFT JOIN variants v ON p.id = v.product_id AND v.is_active = true
-- LEFT JOIN product_images pi ON p.id = pi.product_id
-- WHERE p.is_active = true
-- GROUP BY p.id, p.name, p.category
-- ORDER BY p.created_at DESC;
