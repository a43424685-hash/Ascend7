-- =====================================================
-- 006: products 상세 콘텐츠 필드 추가
-- =====================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS detail_content TEXT;
