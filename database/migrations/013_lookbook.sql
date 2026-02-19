-- 013: 룩북 갤러리 테이블 (관리자가 이미지+설명 등록)
-- Supabase Dashboard > SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS lookbook (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE lookbook ENABLE ROW LEVEL SECURITY;

-- 누구나 활성 룩북 조회 가능
CREATE POLICY "lookbook_select" ON lookbook
  FOR SELECT USING (is_active = true);

-- 관리자만 작성/수정/삭제
CREATE POLICY "lookbook_admin_insert" ON lookbook
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "lookbook_admin_update" ON lookbook
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "lookbook_admin_delete" ON lookbook
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_lookbook_sort_order ON lookbook(sort_order);
CREATE INDEX IF NOT EXISTS idx_lookbook_created_at ON lookbook(created_at DESC);

-- Storage 버킷: lookbook-images (Supabase Dashboard > Storage에서 생성 필요)
-- 버킷 이름: lookbook-images, Public 설정
