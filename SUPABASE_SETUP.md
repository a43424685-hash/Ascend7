# 🔗 Supabase 연결 및 SQL 설정 가이드

## 📋 목차
1. [Supabase 프로젝트 정보 확인](#1-supabase-프로젝트-정보-확인)
2. [.env.local 파일 설정](#2-envlocal-파일-설정)
3. [SQL 스키마 적용](#3-sql-스키마-적용)
4. [연결 테스트](#4-연결-테스트)

---

## 1. Supabase 프로젝트 정보 확인

### 1-1. Supabase 대시보드 접속
1. https://supabase.com 접속
2. 로그인 후 대시보드로 이동
3. **Itero7** 프로젝트 선택

### 1-2. 필요한 정보 확인

#### 프로젝트 URL 확인
1. 왼쪽 메뉴에서 **Settings** (⚙️) 클릭
2. **API** 메뉴 선택
3. **Project URL** 섹션에서 URL 복사
   - 예: `https://abcdefghijklmnop.supabase.co`

#### API 키 확인
같은 페이지에서:

1. **Project API keys** 섹션 찾기
2. **`anon` `public`** 키 복사 → 이것이 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **`service_role` `secret`** 키 복사 → 이것이 `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **주의**: service_role 키는 절대 공개하지 마세요!

---

## 2. .env.local 파일 설정

### 2-1. 파일 생성
프로젝트 루트 디렉토리(`어센드7` 폴더)에 `.env.local` 파일을 생성하세요.

### 2-2. 내용 작성
다음 형식으로 작성하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://[여기에-프로젝트-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe 설정 (나중에 설정 가능)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2-3. 실제 값 입력 예시
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.abcdefghijklmnopqrstuvwxyz1234567890
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4OTY3MjgwLCJleHAiOjE5NTQ1NDMyODB9.abcdefghijklmnopqrstuvwxyz1234567890
```

---

## 3. SQL 스키마 적용

### 방법 1: Supabase 대시보드에서 실행 (가장 쉬움) ⭐

#### 3-1. SQL Editor 열기
1. Supabase 대시보드에서 왼쪽 메뉴의 **SQL Editor** 클릭
2. **New query** 버튼 클릭

#### 3-2. SQL 파일 내용 복사
1. 프로젝트의 `supabase-schema.sql` 파일 열기
2. **전체 내용** 선택 (Ctrl+A) 후 복사 (Ctrl+C)

#### 3-3. SQL 실행
1. SQL Editor에 붙여넣기 (Ctrl+V)
2. **Run** 버튼 클릭 (또는 `Ctrl+Enter` 키)
3. 성공 메시지 확인:
   ```
   Success. No rows returned
   ```

#### 3-4. 테이블 확인
1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - ✅ `products`
   - ✅ `product_images`
   - ✅ `variants`
   - ✅ `orders`
   - ✅ `order_items`

### 방법 2: MCP를 통한 마이그레이션 (고급)

프로젝트 ID를 알려주시면 자동으로 마이그레이션을 적용할 수 있습니다.

---

## 4. 연결 테스트

### 4-1. 의존성 설치
터미널에서 실행:
```bash
npm install
```

### 4-2. 개발 서버 실행
```bash
npm run dev
```

### 4-3. 브라우저에서 확인
1. `http://localhost:3000` 접속
2. 브라우저 개발자 도구 열기 (F12)
3. **Console** 탭에서 에러가 없는지 확인

### 4-4. 테스트 데이터 추가 (선택사항)

SQL Editor에서 다음 쿼리를 실행하여 샘플 제품을 추가할 수 있습니다:

```sql
-- 샘플 제품 추가
INSERT INTO products (slug, name, description, category, is_active) VALUES
('premium-tank-top', 'Premium Tank Top', '고급 탱크톱', 'top', true),
('athletic-shorts', 'Athletic Shorts', '운동용 반바지', 'bottom', true),
('training-gloves', 'Training Gloves', '트레이닝 장갑', 'accessories', true);

-- 제품 ID 확인 (위에서 추가한 제품의 ID를 복사)
SELECT id, slug, name FROM products;

-- 샘플 변형 추가 (위에서 확인한 제품 ID로 교체)
-- 예: 'premium-tank-top' 제품의 ID가 '12345678-1234-1234-1234-123456789abc'인 경우
INSERT INTO variants (product_id, sku, color, size, price, stock, is_active) VALUES
(
  (SELECT id FROM products WHERE slug = 'premium-tank-top'),
  'TANK-BLACK-M',
  'Black',
  'M',
  49000,
  10,
  true
),
(
  (SELECT id FROM products WHERE slug = 'premium-tank-top'),
  'TANK-BLACK-L',
  'Black',
  'L',
  49000,
  8,
  true
),
(
  (SELECT id FROM products WHERE slug = 'athletic-shorts'),
  'SHORTS-BLACK-M',
  'Black',
  'M',
  69000,
  15,
  true
);
```

---

## ❓ 문제 해결

### 문제 1: "Invalid API key" 에러
- **해결**: `.env.local` 파일의 키가 정확한지 다시 확인
- Anon key와 Service Role key를 혼동하지 않았는지 확인

### 문제 2: "Connection refused" 에러
- **해결**: Supabase 프로젝트가 활성화되어 있는지 확인
- 프로젝트가 일시 중지(paused)되어 있을 수 있습니다

### 문제 3: SQL 실행 시 "relation already exists" 에러
- **해결**: 정상입니다! `CREATE TABLE IF NOT EXISTS`를 사용했으므로 안전합니다
- 테이블이 이미 존재하면 건너뜁니다

### 문제 4: SQL 실행 시 "permission denied" 에러
- **해결**: Service Role Key를 사용하고 있는지 확인
- 또는 Supabase 대시보드에서 직접 실행하세요

### 문제 5: 테이블이 보이지 않음
- **해결**: Table Editor에서 새로고침
- 또는 SQL Editor에서 확인:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```

---

## ✅ 체크리스트

연결이 완료되었는지 확인하세요:

- [ ] `.env.local` 파일 생성 완료
- [ ] Supabase URL 입력 완료
- [ ] Anon Key 입력 완료
- [ ] Service Role Key 입력 완료
- [ ] SQL 스키마 실행 완료
- [ ] 5개 테이블 생성 확인
- [ ] `npm run dev` 실행 성공
- [ ] 브라우저에서 에러 없이 로드됨

---

## 🎉 완료!

이제 ITERO7 스토어가 Supabase와 연결되었습니다!

다음 단계:
1. Stripe 계정 설정 (결제 기능 사용 시)
2. 제품 데이터 추가
3. 이미지 업로드 (Supabase Storage 사용)

