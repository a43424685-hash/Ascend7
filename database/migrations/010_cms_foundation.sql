-- ============================================================
-- 010: CMS Foundation (멱등성 보장 - 재실행 가능)
-- is_admin(), audit triggers, site_settings, announcement_bar,
-- hero_banners enhancements
-- ============================================================

-- ─── 1. Utility Functions ───

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auto_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 2. Audit Logs ───

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read audit_logs" ON audit_logs;
CREATE POLICY "Admin read audit_logs"
  ON audit_logs FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "System insert audit_logs" ON audit_logs;
CREATE POLICY "System insert audit_logs"
  ON audit_logs FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION log_audit_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (admin_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 3. Site Settings ───

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read public settings" ON site_settings;
CREATE POLICY "Public read public settings"
  ON site_settings FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Admin select site_settings" ON site_settings;
CREATE POLICY "Admin select site_settings"
  ON site_settings FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin insert site_settings" ON site_settings;
CREATE POLICY "Admin insert site_settings"
  ON site_settings FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin update site_settings" ON site_settings;
CREATE POLICY "Admin update site_settings"
  ON site_settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin delete site_settings" ON site_settings;
CREATE POLICY "Admin delete site_settings"
  ON site_settings FOR DELETE USING (is_admin());

INSERT INTO site_settings (key, value, is_public) VALUES
  ('site_name', '"ASCEND7"', true),
  ('site_description', '"고성능 트레이닝을 위한 프리미엄 짐웨어 브랜드"', true),
  ('logo_url', '""', true),
  ('favicon_url', '""', true),
  ('og_image_url', '""', true)
ON CONFLICT (key) DO NOTHING;

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION auto_update_updated_at();

DROP TRIGGER IF EXISTS site_settings_audit ON site_settings;
CREATE TRIGGER site_settings_audit
  AFTER INSERT OR UPDATE OR DELETE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- ─── 4. Announcement Bar ───

CREATE TABLE IF NOT EXISTS announcement_bar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text_ko TEXT NOT NULL DEFAULT '',
  text_en TEXT DEFAULT '',
  link_url TEXT,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light','brand','accent')),
  is_active BOOLEAN DEFAULT false,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

ALTER TABLE announcement_bar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active announcements" ON announcement_bar;
CREATE POLICY "Public read active announcements"
  ON announcement_bar FOR SELECT
  USING (
    is_active = true
    AND (start_at IS NULL OR now() >= start_at)
    AND (end_at IS NULL OR now() <= end_at)
  );

DROP POLICY IF EXISTS "Admin select announcements" ON announcement_bar;
CREATE POLICY "Admin select announcements"
  ON announcement_bar FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin insert announcements" ON announcement_bar;
CREATE POLICY "Admin insert announcements"
  ON announcement_bar FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin update announcements" ON announcement_bar;
CREATE POLICY "Admin update announcements"
  ON announcement_bar FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin delete announcements" ON announcement_bar;
CREATE POLICY "Admin delete announcements"
  ON announcement_bar FOR DELETE USING (is_admin());

CREATE UNIQUE INDEX IF NOT EXISTS idx_announcement_single_active
  ON announcement_bar (is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS announcement_bar_updated_at ON announcement_bar;
CREATE TRIGGER announcement_bar_updated_at
  BEFORE UPDATE ON announcement_bar
  FOR EACH ROW EXECUTE FUNCTION auto_update_updated_at();

DROP TRIGGER IF EXISTS announcement_bar_audit ON announcement_bar;
CREATE TRIGGER announcement_bar_audit
  AFTER INSERT OR UPDATE OR DELETE ON announcement_bar
  FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- ─── 5. Hero Banners 확장 ───

ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS image_mobile_url TEXT;
ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS title_en TEXT DEFAULT '';
ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS subtitle_en TEXT DEFAULT '';
ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS cta_buttons JSONB DEFAULT '[]';
ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;
ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;
ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view active banners" ON hero_banners;
  DROP POLICY IF EXISTS "Admins can manage banners" ON hero_banners;
  DROP POLICY IF EXISTS "Public read active banners" ON hero_banners;
  DROP POLICY IF EXISTS "Admin select banners" ON hero_banners;
  DROP POLICY IF EXISTS "Admin insert banners" ON hero_banners;
  DROP POLICY IF EXISTS "Admin update banners" ON hero_banners;
  DROP POLICY IF EXISTS "Admin delete banners" ON hero_banners;
END $$;

CREATE POLICY "Public read active banners"
  ON hero_banners FOR SELECT
  USING (
    is_active = true
    AND (start_at IS NULL OR now() >= start_at)
    AND (end_at IS NULL OR now() <= end_at)
  );

CREATE POLICY "Admin select banners"
  ON hero_banners FOR SELECT USING (is_admin());

CREATE POLICY "Admin insert banners"
  ON hero_banners FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin update banners"
  ON hero_banners FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin delete banners"
  ON hero_banners FOR DELETE USING (is_admin());

DROP TRIGGER IF EXISTS hero_banners_updated_at ON hero_banners;
CREATE TRIGGER hero_banners_updated_at
  BEFORE UPDATE ON hero_banners
  FOR EACH ROW EXECUTE FUNCTION auto_update_updated_at();

DROP TRIGGER IF EXISTS hero_banners_audit ON hero_banners;
CREATE TRIGGER hero_banners_audit
  AFTER INSERT OR UPDATE OR DELETE ON hero_banners
  FOR EACH ROW EXECUTE FUNCTION log_audit_change();
