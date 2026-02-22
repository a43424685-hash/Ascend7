-- ============================================================
-- ASCEND7 새 기능 마이그레이션
-- 실행: Supabase Dashboard > SQL Editor에서 전체 복사 후 실행
-- ============================================================

-- ─── 1. 찜하기 (Wishlists) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- RLS 설정
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlists" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlists" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlists" ON wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);


-- ─── 2. 플래시 세일 (Flash Sales) ───────────────────────────────
CREATE TABLE IF NOT EXISTS flash_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES variants(id) ON DELETE SET NULL,
  sale_price INTEGER NOT NULL,
  original_price INTEGER NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  end_at TIMESTAMPTZ NOT NULL,
  max_quantity INTEGER,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: 모두 읽기 가능, 관리자만 수정
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flash sales are publicly visible" ON flash_sales
  FOR SELECT USING (true);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_flash_sales_is_active ON flash_sales(is_active);
CREATE INDEX IF NOT EXISTS idx_flash_sales_end_at ON flash_sales(end_at);


-- ─── 3. 적립금/포인트 (Point Transactions) ──────────────────────
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 서비스 롤만 insert 가능 (사용자 직접 조작 방지)
-- 인덱스
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_order_id ON point_transactions(order_id);


-- ─── 4. 인스타그램 피드 (Instagram Posts) ──────────────────────
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  link_url TEXT,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 공개 읽기 가능
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instagram posts are publicly visible" ON instagram_posts
  FOR SELECT USING (true);


-- ─── 5. 번들/세트 할인 (Bundle Deals) ──────────────────────────
CREATE TABLE IF NOT EXISTS bundle_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  product_slugs TEXT[] DEFAULT '{}',
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  discount_fixed INTEGER NOT NULL DEFAULT 0,
  min_items INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bundle_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bundle deals are publicly visible" ON bundle_deals
  FOR SELECT USING (true);


-- ─── 6. orders 테이블 추가 컬럼 (적립금 사용액) ─────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS points_used INTEGER DEFAULT 0;


-- ─── 완료 메시지 ─────────────────────────────────────────────
SELECT 'Migration completed successfully!' AS result;
