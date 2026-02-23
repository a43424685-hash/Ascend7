-- =============================================
-- 포인트 시스템 개선 + 공지 배너 슬라이드
-- =============================================

-- 1. point_transactions: order_id를 nullable로 변경 (회원가입/리뷰 포인트는 order 없음)
ALTER TABLE point_transactions ALTER COLUMN order_id DROP NOT NULL;

-- 2. 공지 배너 기본 슬라이드 4개 추가
-- (announcement_bar 테이블이 이미 존재하는 경우에만 실행)
INSERT INTO announcement_bar (text_ko, link_url, theme, is_active, sort_order)
VALUES
  ('🎁 신규 회원가입 시 3,000P 즉시 지급', '/auth/login', 'brand', true, 1),
  ('🚚 5만원 이상 구매 시 무료배송', '/shop', 'brand', true, 2),
  ('⭐ 포토리뷰 2,000P · 텍스트리뷰 1,000P 적립', '/community/review', 'brand', true, 3),
  ('💬 카카오 채널 추가하고 재입고 알림 받기', null, 'brand', true, 4);
