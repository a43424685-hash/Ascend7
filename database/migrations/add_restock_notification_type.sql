-- restock_alerts에 알림 유형 컬럼 추가
ALTER TABLE restock_alerts
  ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'email' CHECK (notification_type IN ('email', 'kakao'));
