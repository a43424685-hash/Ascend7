-- =============================================
-- 포인트 시스템 개선
-- =============================================

-- ✅ 실행 완료: point_transactions order_id nullable 처리
-- (회원가입 보너스, 리뷰 포인트 등 order 없는 적립 허용)
ALTER TABLE point_transactions ALTER COLUMN order_id DROP NOT NULL;

-- 공지 배너 슬라이드는 코드 내 DEFAULT_SLIDES로 하드코딩되어 있어 DB 불필요
