-- Migration 021: 리뷰 이미지 URL 배열 컬럼 추가
-- Supabase Dashboard > SQL Editor에서 실행

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- review-images 버킷 생성 (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- 업로드 정책: 로그인 유저만 업로드 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'review_images_insert'
  ) THEN
    CREATE POLICY "review_images_insert" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'review-images');
  END IF;
END $$;

-- 읽기 정책: 누구나 읽기 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'review_images_select'
  ) THEN
    CREATE POLICY "review_images_select" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'review-images');
  END IF;
END $$;
