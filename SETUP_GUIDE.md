# ITERO7 Supabase 연결 가이드

## 1단계: Supabase 프로젝트 정보 확인

Supabase 대시보드에서 다음 정보를 확인하세요:

1. **프로젝트 URL**: `https://[프로젝트ID].supabase.co`
2. **Anon Key**: Settings > API > Project API keys > `anon` `public` 키
3. **Service Role Key**: Settings > API > Project API keys > `service_role` `secret` 키

## 2단계: .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe 설정 (나중에 설정 가능)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**중요**: 
- `[프로젝트ID]`를 실제 프로젝트 ID로 교체하세요
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다

## 3단계: SQL 스키마 적용

### 방법 1: Supabase 대시보드에서 직접 실행 (권장)

1. Supabase 대시보드 접속
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. **New query** 클릭
4. `supabase-schema.sql` 파일의 전체 내용을 복사하여 붙여넣기
5. **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
6. 성공 메시지 확인

### 방법 2: MCP를 통한 마이그레이션 적용

프로젝트가 확인되면 자동으로 마이그레이션을 적용할 수 있습니다.

## 4단계: 연결 테스트

1. 개발 서버 실행:
```bash
npm install
npm run dev
```

2. 브라우저에서 `http://localhost:3000` 접속
3. 콘솔에서 에러가 없는지 확인

## 5단계: 테스트 데이터 추가 (선택사항)

SQL Editor에서 다음 쿼리를 실행하여 샘플 데이터를 추가할 수 있습니다:

```sql
-- 샘플 제품 추가
INSERT INTO products (slug, name, description, category, is_active) VALUES
('premium-tank-top', 'Premium Tank Top', '고급 탱크톱', 'top', true),
('athletic-shorts', 'Athletic Shorts', '운동용 반바지', 'bottom', true);

-- 샘플 이미지 추가 (제품 ID는 위에서 생성된 ID로 교체)
-- INSERT INTO product_images (product_id, url, sort_order) VALUES
-- ('[제품ID]', 'https://example.com/image.jpg', 0);

-- 샘플 변형 추가
-- INSERT INTO variants (product_id, sku, color, size, price, stock, is_active) VALUES
-- ('[제품ID]', 'TANK-BLACK-M', 'Black', 'M', 49000, 10, true);
```

## 문제 해결

### 연결 오류가 발생하는 경우:
1. `.env.local` 파일의 URL과 키가 정확한지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 브라우저 콘솔의 에러 메시지 확인

### SQL 실행 오류가 발생하는 경우:
1. 테이블이 이미 존재하는 경우: `CREATE TABLE IF NOT EXISTS`를 사용했으므로 안전합니다
2. 권한 오류: Service Role Key를 사용하는지 확인
3. 외래 키 오류: `auth.users` 테이블이 존재하는지 확인 (Supabase가 자동 생성)

