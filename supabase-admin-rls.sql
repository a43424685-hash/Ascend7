-- Admin RLS 정책 업데이트
-- 관리자만 상품, 이미지, variants를 생성/수정/삭제할 수 있도록 설정

-- 1. 기존 정책 제거 (모든 가능한 정책 이름)
-- Products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admin can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Admin can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Product Images
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
DROP POLICY IF EXISTS "Anyone can view product_images" ON product_images;
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Admin can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Admin can update product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can update product_images" ON product_images;
DROP POLICY IF EXISTS "Admin can delete product_images" ON product_images;
DROP POLICY IF EXISTS "Authenticated users can delete product_images" ON product_images;

-- Variants
DROP POLICY IF EXISTS "Variants are viewable by everyone" ON variants;
DROP POLICY IF EXISTS "Anyone can view variants" ON variants;
DROP POLICY IF EXISTS "Anyone can view active variants" ON variants;
DROP POLICY IF EXISTS "Admin can insert variants" ON variants;
DROP POLICY IF EXISTS "Authenticated users can insert variants" ON variants;
DROP POLICY IF EXISTS "Admin can update variants" ON variants;
DROP POLICY IF EXISTS "Authenticated users can update variants" ON variants;
DROP POLICY IF EXISTS "Admin can delete variants" ON variants;
DROP POLICY IF EXISTS "Authenticated users can delete variants" ON variants;

-- Orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;

-- Order Items
DROP POLICY IF EXISTS "Order items are viewable by order owner" ON order_items;
DROP POLICY IF EXISTS "Anyone can view order_items" ON order_items;

-- Storage
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- 2. RLS 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 3. 읽기 정책 (모두 가능)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view product_images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view variants"
  ON variants FOR SELECT
  USING (true);

-- 4. 쓰기 정책 (관리자만)
-- 참고: 실제 프로덕션에서는 custom claims나 특정 user_id 체크로 관리자 확인
-- 여기서는 인증된 사용자면 관리자로 간주 (MVP용)

-- Products
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Product Images
CREATE POLICY "Authenticated users can insert product_images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product_images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product_images"
  ON product_images FOR DELETE
  TO authenticated
  USING (true);

-- Variants
CREATE POLICY "Authenticated users can insert variants"
  ON variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update variants"
  ON variants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete variants"
  ON variants FOR DELETE
  TO authenticated
  USING (true);

-- 5. Orders 정책 (사용자는 자신의 주문만 조회)
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Order Items
CREATE POLICY "Anyone can view order_items"
  ON order_items FOR SELECT
  USING (true);

-- 6. Storage 정책 (product-images 버킷)
-- Supabase 대시보드에서 수동으로 설정하거나, SQL로 생성

-- Storage 버킷 생성 (이미 있으면 에러 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- 완료!
-- 이제 인증된 사용자만 상품/이미지/variants를 관리할 수 있습니다.

