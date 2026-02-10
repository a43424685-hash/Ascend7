-- ASCEND7 Database Schema

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Variants table
CREATE TABLE IF NOT EXISTS variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total INTEGER NOT NULL,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES variants(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_is_active ON variants(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Function to decrement stock (optional, can be used in webhook)
CREATE OR REPLACE FUNCTION decrement_stock(
  variant_id UUID,
  quantity INTEGER
) RETURNS void AS $$
BEGIN
  UPDATE variants
  SET stock = GREATEST(0, stock - quantity)
  WHERE id = variant_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products: 모든 사용자가 활성화된 제품만 조회 가능
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

-- Product Images: 제품과 연결된 이미지만 조회 가능
CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND products.is_active = true
    )
  );

-- Variants: 활성화된 제품의 활성화된 변형만 조회 가능
CREATE POLICY "Variants are viewable by everyone"
  ON variants FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM products
      WHERE products.id = variants.product_id
      AND products.is_active = true
    )
  );

-- Orders: 사용자는 자신의 주문만 조회 가능
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Order Items: 주문과 연결된 항목만 조회 가능
CREATE POLICY "Order items are viewable by order owner"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

