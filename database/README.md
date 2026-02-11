# Database Setup

Supabase SQL 파일 실행 순서:

1. `01_schema.sql` - 테이블 스키마 생성
2. `02_stability.sql` - 안정화 함수 및 동시성 제어
3. `03_rls.sql` - Row Level Security 정책
4. `04_seed.sql` - 시드 데이터 (개발용)
5. `05_orders_enhancement.sql` - 주문 관리 시스템

## Migrations

`migrations/` 폴더에는 기존 DB에 적용할 마이그레이션 파일들이 있습니다.
