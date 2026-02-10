# 환경 변수 설정 가이드

이 파일을 `.env.local`로 복사하고 실제 값으로 채워주세요.

## .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하세요.

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe 설정
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

---

## 각 환경 변수 설명

### Supabase

#### NEXT_PUBLIC_SUPABASE_URL
- **설명**: Supabase 프로젝트 API URL
- **위치**: Supabase 대시보드 → Settings → API → Project URL
- **형식**: `https://xxxxxxxxxxxxx.supabase.co`
- **주의**: 
  - `https://`로 시작해야 함
  - `.supabase.co`로 끝나야 함
  - 대시보드 URL (`app.supabase.com`)이 아님

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **설명**: Supabase 익명 접근 키 (클라이언트용)
- **위치**: Supabase 대시보드 → Settings → API → Project API keys → anon public
- **형식**: `eyJ...`로 시작하는 긴 JWT 토큰
- **주의**: 
  - RLS 정책을 따름
  - 클라이언트에 노출되어도 안전

#### SUPABASE_SERVICE_ROLE_KEY
- **설명**: Supabase 서비스 역할 키 (서버용, RLS 우회)
- **위치**: Supabase 대시보드 → Settings → API → Project API keys → service_role
- **형식**: `eyJ...`로 시작하는 긴 JWT 토큰
- **주의**: 
  - ⚠️ **절대 클라이언트에 노출하지 마세요!**
  - RLS를 우회하므로 서버에서만 사용
  - Webhook 처리에 필요

---

### Stripe

#### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **설명**: Stripe 공개 키 (클라이언트용)
- **위치**: Stripe 대시보드 → Developers → API keys → Publishable key
- **형식**: `pk_test_...` (테스트) 또는 `pk_live_...` (프로덕션)
- **주의**: 
  - 클라이언트에 노출되어도 안전
  - 테스트 모드 키로 시작

#### STRIPE_SECRET_KEY
- **설명**: Stripe 비밀 키 (서버용)
- **위치**: Stripe 대시보드 → Developers → API keys → Secret key
- **형식**: `sk_test_...` (테스트) 또는 `sk_live_...` (프로덕션)
- **주의**: 
  - ⚠️ **절대 클라이언트에 노출하지 마세요!**
  - 서버에서만 사용
  - Checkout Session 생성에 필요

#### STRIPE_WEBHOOK_SECRET
- **설명**: Stripe Webhook 서명 비밀
- **위치**: 
  - 로컬: Stripe CLI 실행 시 출력 (`whsec_...`)
  - 프로덕션: Stripe 대시보드 → Developers → Webhooks → Signing secret
- **형식**: `whsec_...`로 시작
- **주의**: 
  - Webhook 요청 검증에 필요
  - 로컬과 프로덕션 값이 다름

---

### 앱 설정

#### NEXT_PUBLIC_APP_URL
- **설명**: 애플리케이션의 기본 URL
- **형식**: 
  - 로컬: `http://localhost:3004`
  - 프로덕션: `https://yourdomain.com`
- **주의**: 
  - Stripe Checkout 리디렉션 URL에 사용
  - 끝에 슬래시(`/`) 없이

---

## 설정 확인

### 1. 환경 변수 로드 확인
```bash
npm run dev
```

### 2. 브라우저에서 확인
- 홈페이지(`/`)에서 제품이 표시되는지 확인
- 개발자 도구 → Console에서 에러 확인

### 3. Supabase 연결 테스트
```bash
# 브라우저에서 접속
http://localhost:3004/api/test-supabase
```

예상 응답:
```json
{
  "status": "success",
  "message": "Supabase 연결 성공",
  "productCount": 3
}
```

---

## 자주 하는 실수

### ❌ 잘못된 예시
```bash
# URL 끝에 슬래시
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co/

# 대시보드 URL 사용
NEXT_PUBLIC_SUPABASE_URL=https://app.supabase.com/project/xxxxx

# 키에 공백
NEXT_PUBLIC_SUPABASE_ANON_KEY= eyJhbGc...

# 따옴표 사용
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
```

### ✅ 올바른 예시
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 보안 주의사항

### 클라이언트에 노출되는 변수
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅
- `NEXT_PUBLIC_APP_URL` ✅

### 서버 전용 변수 (절대 노출 금지)
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️
- `STRIPE_SECRET_KEY` ⚠️
- `STRIPE_WEBHOOK_SECRET` ⚠️

### Git에 커밋 금지
`.gitignore`에 다음이 포함되어 있는지 확인:
```
.env.local
.env*.local
```

---

## 프로덕션 배포 시

### Vercel
1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 모든 환경 변수 추가
3. `NEXT_PUBLIC_APP_URL`을 실제 도메인으로 변경
4. Stripe 키를 Live 모드 키로 변경

### 다른 플랫폼 (Netlify, AWS 등)
각 플랫폼의 환경 변수 설정 방법을 따르세요.

