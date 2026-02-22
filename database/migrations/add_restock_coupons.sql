-- 재입고 알림 신청 테이블
CREATE TABLE IF NOT EXISTS restock_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restock_alerts_variant ON restock_alerts(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_restock_alerts_email ON restock_alerts(email);
CREATE INDEX IF NOT EXISTS idx_restock_alerts_notified ON restock_alerts(notified_at) WHERE notified_at IS NULL;

-- RLS 정책 (어드민만 조회/수정, 누구나 신청 가능)
ALTER TABLE restock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert restock alert" ON restock_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can select all restock alerts" ON restock_alerts
  FOR SELECT USING (true);

CREATE POLICY "Admin can update restock alerts" ON restock_alerts
  FOR UPDATE USING (true);


-- 쿠폰 테이블
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- RLS (서비스 롤만 접근)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for coupons" ON coupons
  USING (true);


-- orders 테이블에 쿠폰 컬럼 추가
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
