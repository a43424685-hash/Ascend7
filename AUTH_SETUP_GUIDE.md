# 🔐 Supabase Auth 로그인 시스템 설정 가이드

## 📋 목차
1. [개요](#개요)
2. [Supabase Dashboard 설정](#supabase-dashboard-설정)
3. [카카오 OAuth 설정](#카카오-oauth-설정)
4. [환경 변수 확인](#환경-변수-확인)
5. [테스트](#테스트)
6. [문제 해결](#문제-해결)

---

## 🎯 개요

이 프로젝트에는 완전한 Supabase Auth 로그인 시스템이 구현되어 있습니다:

### ✨ 구현된 기능
- ✅ **이메일/비밀번호 로그인** (회원가입 포함)
- ✅ **카카오 OAuth 로그인**
- ✅ **세션 자동 갱신** (Middleware)
- ✅ **Admin 권한 기반 접근 제어** (profiles.role)
- ✅ **로그인 후 자동 라우팅** (admin → /admin/orders, user → /)
- ✅ **Header에 로그인/로그아웃 버튼**

---

## 🔧 Supabase Dashboard 설정

### 1단계: Email Auth 활성화

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Email** 찾기
3. **Enable** 토글 ON
4. **Confirm email** 설정:
   - 개발: OFF (빠른 테스트용)
   - 프로덕션: ON (보안)
5. **Save** 클릭

### 2단계: Site URL 설정

1. **Authentication** → **URL Configuration**
2. **Site URL** 입력:
   ```
   로컬: http://localhost:3000
   프로덕션: https://your-app.vercel.app
   ```
3. **Redirect URLs** 추가:
   ```
   http://localhost:3000/auth/callback
   https://your-app.vercel.app/auth/callback
   ```
4. **Save** 클릭

---

## 🟡 카카오 OAuth 설정

### 1단계: 카카오 개발자 콘솔 설정

1. https://developers.kakao.com 접속
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 이름: "ITERO7" (원하는 이름)
4. 앱 생성 완료 후:

**A. 플랫폼 설정**
- **Web 플랫폼 등록**
- 사이트 도메인:
  ```
  http://localhost:3000
  https://your-app.vercel.app
  ```

**B. Redirect URI 설정**
- **제품 설정** → **카카오 로그인** → **Redirect URI**
- URI 추가:
  ```
  https://[프로젝트ID].supabase.co/auth/v1/callback
  ```
  > 💡 이 URI는 Supabase 프로젝트의 API URL + `/auth/v1/callback`

**C. 동의 항목 설정**
- **제품 설정** → **카카오 로그인** → **동의항목**
- 필수 동의:
  - 닉네임 (필수)
  - 카카오계정(이메일) (필수)

**D. 앱 키 복사**
- **앱 설정** → **앱 키**
- **REST API 키** 복사 (이게 Client ID)
- **Client Secret**: **제품 설정** → **카카오 로그인** → **보안** → **Client Secret** 생성 및 복사

### 2단계: Supabase에 카카오 연동

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Kakao** 찾기
3. **Enable** 토글 ON
4. 설정 입력:
   ```
   Client ID: [카카오 REST API 키]
   Client Secret: [카카오 Client Secret]
   Redirect URL: https://[프로젝트ID].supabase.co/auth/v1/callback
   ```
5. **Save** 클릭

### 3단계: Kakao 앱 활성화

1. 카카오 개발자 콘솔 → **앱 설정**
2. **상태** → **서비스 중 ON** 클릭
3. (필요시) 비즈 앱 전환 또는 검수 진행

---

## 🔑 환경 변수 확인

`.env.local` 파일에 다음 변수가 설정되어 있어야 합니다:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase Admin (이미 설정됨)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (이미 설정됨)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Vercel 환경 변수도 동일하게 설정하세요!**

---

## ✅ 테스트

### 1. 로컬 개발 서버 실행

```bash
npm run dev
```

### 2. 이메일 로그인 테스트

1. http://localhost:3000/auth/login 접속
2. **회원가입** 탭:
   - 이메일: `test@example.com`
   - 비밀번호: `test1234`
   - **회원가입** 버튼 클릭
3. (Confirm email OFF인 경우) 바로 로그인 가능
4. **로그인** 탭:
   - 이메일/비밀번호 입력
   - **로그인** 버튼 클릭
5. 홈으로 리다이렉트 확인
6. Header에 **이메일 표시** + **LOGOUT** 버튼 확인

### 3. 카카오 로그인 테스트

1. http://localhost:3000/auth/login 접속
2. **카카오 로그인** 버튼 클릭
3. 카카오 로그인 페이지로 이동
4. 로그인 후 동의 → 리다이렉트
5. 홈으로 돌아옴 확인

### 4. Admin 권한 테스트

**4-1. Admin 계정 만들기:**

Supabase SQL Editor에서 실행:

```sql
-- 1. 현재 로그인한 계정의 이메일 확인
SELECT email FROM auth.users;

-- 2. Admin 권한 부여
SELECT make_user_admin('your-email@example.com');
```

**4-2. Admin 접근 테스트:**

1. 로그아웃 → 로그인
2. Header에 **👑 ADMIN** 링크 표시 확인
3. `/admin/orders` 접속 가능 확인
4. 로그아웃 후 일반 계정으로 로그인
5. `/admin/orders` 접속 시도 → 홈으로 리다이렉트 확인

---

## 🐛 문제 해결

### Q1. "Invalid redirect URL" 에러 (카카오)

**원인:** 카카오 개발자 콘솔의 Redirect URI가 잘못됨

**해결:**
```
카카오: https://[프로젝트ID].supabase.co/auth/v1/callback
                                          ^^^^^^^^^^^^^^
Supabase: Authentication → Providers → Kakao → Redirect URL 복사
```

### Q2. 로그인 후 Header에 LOGIN이 여전히 표시됨

**원인:** 세션 쿠키가 설정되지 않음

**해결:**
1. 브라우저 쿠키 삭제
2. 개발 서버 재시작
3. 다시 로그인
4. 페이지 새로고침

### Q3. Admin 권한이 없는데 /admin에 접근됨

**원인:** Middleware가 작동하지 않음

**해결:**
1. `middleware.ts` 파일이 프로젝트 루트에 있는지 확인
2. 개발 서버 재시작
3. 브라우저 캐시 삭제

### Q4. 카카오 로그인 후 "동의 항목 누락" 에러

**원인:** 카카오 개발자 콘솔에서 동의 항목 미설정

**해결:**
1. 카카오 개발자 콘솔 → **제품 설정** → **카카오 로그인** → **동의항목**
2. **닉네임**, **카카오계정(이메일)** 필수 동의 설정
3. 저장 후 다시 로그인

### Q5. "Email not confirmed" 에러

**원인:** Supabase Email Confirm 설정이 ON

**해결:**
1. Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. **Confirm email** → OFF (개발용)
3. 또는 이메일 확인 링크 클릭

### Q6. Middleware에서 무한 리다이렉트

**원인:** Middleware가 `/auth/login`도 체크하고 있음

**해결:** `middleware.ts`의 `config.matcher`가 올바른지 확인:
```typescript
matcher: [
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
]
```

---

## 📚 파일 구조

```
app/
├── auth/
│   ├── login/
│   │   └── page.tsx          # 로그인 페이지
│   └── callback/
│       └── route.ts          # OAuth 콜백
middleware.ts                  # 세션 갱신 + Admin 보호
src/
├── features/
│   └── auth/
│       ├── auth-button.tsx   # Header 인증 버튼 (Server)
│       └── logout-button.tsx # 로그아웃 버튼 (Client)
└── shared/
    └── lib/
        ├── supabase/
        │   ├── client.ts     # 브라우저용 클라이언트
        │   └── server.ts     # 서버용 클라이언트
        └── auth/
            └── admin.ts      # Admin 권한 체크
```

---

## 🎯 주요 흐름

### 이메일 로그인
```
1. /auth/login 페이지
2. signInWithPassword()
3. profiles.role 확인
4. admin → /admin/orders
   user  → /
```

### 카카오 OAuth
```
1. /auth/login 페이지
2. signInWithOAuth({ provider: 'kakao' })
3. 카카오 로그인 페이지 → 인증
4. /auth/callback?code=...
5. exchangeCodeForSession()
6. profiles.role 확인
7. admin → /admin/orders
   user  → /
```

### Admin 보호
```
1. 모든 요청 → middleware.ts
2. /admin/* 경로?
   - Yes → user 확인
     - 없음 → /auth/login
     - 있음 → profiles.role 확인
       - admin → 통과 ✅
       - user  → / 리다이렉트 ❌
   - No → 통과
```

---

## 🎉 완료!

이제 완전한 Supabase Auth 로그인 시스템이 작동합니다!

**체크리스트:**
- ✅ 이메일 로그인
- ✅ 카카오 OAuth
- ✅ 세션 갱신
- ✅ Admin 권한 보호
- ✅ 로그인 후 자동 라우팅
- ✅ Header 인증 버튼

문제가 있으면 위의 문제 해결 섹션을 참고하세요! 🚀

