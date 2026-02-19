-- 014: Q&A 문의 테이블
-- Supabase Dashboard > SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS qna (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_secret BOOLEAN DEFAULT false,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  answered_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE qna ENABLE ROW LEVEL SECURITY;

-- 비밀글이 아니거나, 본인 글이거나, 관리자이면 조회 가능
CREATE POLICY "qna_select" ON qna
  FOR SELECT USING (
    is_active = true AND (
      is_secret = false OR
      auth.uid() = user_id OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- 로그인 유저만 작성 (본인 user_id로만)
CREATE POLICY "qna_insert" ON qna
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 또는 관리자만 수정 (관리자는 answer 필드 입력)
CREATE POLICY "qna_update" ON qna
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 본인 또는 관리자만 삭제
CREATE POLICY "qna_delete" ON qna
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_qna_user_id ON qna(user_id);
CREATE INDEX IF NOT EXISTS idx_qna_product_id ON qna(product_id);
CREATE INDEX IF NOT EXISTS idx_qna_created_at ON qna(created_at DESC);
