-- Hero Banners table for homepage slider
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '/shop',
  link_text TEXT DEFAULT 'SHOP NOW',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Everyone can read active banners
CREATE POLICY "Anyone can view active banners"
  ON hero_banners FOR SELECT
  USING (is_active = true);

-- Only admins can manage banners
CREATE POLICY "Admins can manage banners"
  ON hero_banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
