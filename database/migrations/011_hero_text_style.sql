-- ============================================================
-- 011: Hero Banner Text Style (멱등성 보장)
-- hero_banners에 text_style JSONB 컬럼 추가
-- ============================================================

ALTER TABLE hero_banners ADD COLUMN IF NOT EXISTS text_style JSONB DEFAULT '{}';
