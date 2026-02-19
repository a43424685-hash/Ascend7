-- 019: audit 트리거 함수 수정 - id 없는 테이블(site_settings 등) 호환
-- NEW.id::text 대신 to_jsonb(NEW)->>'id' 사용 (컬럼 없으면 NULL 반환)
CREATE OR REPLACE FUNCTION log_audit_change()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (admin_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN (to_jsonb(NEW)->>'id') END,
      CASE WHEN TG_OP = 'DELETE'              THEN (to_jsonb(OLD)->>'id') END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN (to_jsonb(NEW)->>'key') END,
      CASE WHEN TG_OP = 'DELETE'              THEN (to_jsonb(OLD)->>'key') END,
      'unknown'
    ),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
