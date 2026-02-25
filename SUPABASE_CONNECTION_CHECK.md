# 🔍 Supabase 연결 확인 가이드

## ✅ 체크리스트

### 1단계: .env.local 파일 확인

- [ ] 프로젝트 루트에 `.env.local` 파일이 있는가?
- [ ] `NEXT_PUBLIC_SUPABASE_URL`이 설정되어 있는가?
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되어 있는가?
- [ ] URL 형식이 `https://[프로젝트ID].supabase.co`인가?
- [ ] URL 끝에 슬래시(`/`)가 없는가?

### 2단계: Supabase 대시보드에서 값 확인

1. **Supabase 대시보드 접속**
   - https://supabase.com 접속
   - Itero7 프로젝트 선택

2. **Settings → API 메뉴**
   - Project URL 복사 → `NEXT_PUBLIC_SUPABASE_URL`에 붙여넣기
   - `anon` `public` 키 복사 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 붙여넣기

3. **SQL Editor에서 테이블 확인**
   - `products` 테이블이 있는지 확인
   - 데이터가 있는지 확인

### 3단계: 연결 테스트

#### 방법 1: API 엔드포인트 테스트 (가장 빠름)

브라우저에서 다음 주소로 접속:
```
http://localhost:3000/api/test-supabase
```

**성공 시:**
```json
{
  "success": true,
  "message": "Supabase 연결 성공",
  "data": {
    "productCount": 5,
    "products": [...]
  }
}
```

**실패 시:**
- 에러 메시지와 로그가 표시됩니다
- 로그를 확인하여 문제를 파악하세요

#### 방법 2: 서버 콘솔 로그 확인

1. 터미널에서 `npm run dev` 실행
2. 브라우저에서 `http://localhost:3000` 접속
3. 터미널 콘솔에서 다음 로그 확인:

```
🔍 Supabase 환경 변수 확인:
  - URL 설정: ✅ https://...
  - URL 형식: ✅ 올바름
  - Anon Key 설정: ✅
  - Anon Key 길이: 200 자

📦 getProducts 호출됨
✅ Supabase 클라이언트 생성 성공
🔍 products 테이블 조회 시작...
📊 쿼리 결과: { hasData: true, dataLength: 5, ... }
✅ 제품 처리 완료: { 총개수: 5, 제품명: [...] }
```

#### 방법 3: 홈 페이지에서 확인

1. `http://localhost:3000` 접속
2. FEATURED 섹션 확인
   - ✅ 성공: 제품이 표시됨
   - ❌ 실패: 에러 메시지 표시됨

### 4단계: 문제 해결

#### 문제 1: "환경 변수가 설정되지 않았습니다"

**해결:**
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 파일 이름이 정확히 `.env.local`인지 확인 (`.env` 아님)
3. 개발 서버 재시작: `npm run dev`

#### 문제 2: "잘못된 Supabase URL 형식"

**해결:**
1. URL이 `https://`로 시작하는지 확인
2. URL이 `.supabase.co`로 끝나는지 확인
3. 대시보드 URL이 아닌 **API URL**인지 확인
   - ❌ 잘못됨: `https://app.supabase.com/project/...`
   - ✅ 올바름: `https://[프로젝트ID].supabase.co`

#### 문제 3: "데이터베이스 테이블이 없습니다"

**해결:**
1. Supabase SQL Editor 열기
2. `supabase-schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 Run 클릭
4. 성공 메시지 확인

#### 문제 4: "제품이 없습니다"

**해결:**
1. Supabase Table Editor에서 `products` 테이블 확인
2. 데이터가 없으면 샘플 데이터 추가:

```sql
INSERT INTO products (slug, name, description, category, is_active) VALUES
('test-product', 'Test Product', '테스트 제품', 'top', true);
```

## 📊 로그 확인 위치

### 서버 로그 (터미널)
- 환경 변수 확인
- 클라이언트 생성
- 쿼리 실행
- 에러 발생

### 브라우저 콘솔 (F12)
- 클라이언트 사이드 에러
- 네트워크 요청 실패

### API 응답
- `/api/test-supabase` 엔드포인트
- JSON 형식의 상세 정보

## 🎯 성공 기준

다음이 모두 확인되면 연결 성공:

1. ✅ `/api/test-supabase`에서 `success: true` 응답
2. ✅ 서버 콘솔에 "✅ 제품 처리 완료" 로그
3. ✅ 홈 페이지에 제품이 표시됨
4. ✅ 에러 메시지가 없음

