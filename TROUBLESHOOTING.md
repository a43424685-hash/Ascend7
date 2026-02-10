# 🔧 Supabase 연결 오류 해결 가이드

## 현재 오류 분석

에러 메시지에 HTML이 포함되어 있는 것은 **Supabase API URL이 잘못 설정**되었다는 의미입니다.

## ✅ 해결 방법

### 1. .env.local 파일 확인

`.env.local` 파일을 열어서 다음을 확인하세요:

#### ❌ 잘못된 URL 예시:
```env
# 대시보드 URL (잘못됨!)
NEXT_PUBLIC_SUPABASE_URL=https://app.supabase.com/project/xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/xxxxx

# 프로젝트 ID만 있는 경우 (잘못됨!)
NEXT_PUBLIC_SUPABASE_URL=abcdefghijklmnop

# 슬래시로 끝나는 경우 (잘못됨!)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co/
```

#### ✅ 올바른 URL 형식:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

**중요**: 
- `https://`로 시작해야 함
- `[프로젝트ID].supabase.co` 형식이어야 함
- 끝에 슬래시(`/`)가 없어야 함
- 대시보드 URL이 아닌 **API URL**이어야 함

### 2. Supabase 대시보드에서 올바른 URL 확인

1. Supabase 대시보드 접속
2. **Settings** (⚙️) → **API** 메뉴
3. **Project URL** 섹션에서 URL 복사
   - 예: `https://abcdefghijklmnop.supabase.co`
   - 이 URL을 그대로 복사하세요!

### 3. 환경 변수 확인 체크리스트

`.env.local` 파일에서 확인:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`이 `https://[프로젝트ID].supabase.co` 형식인가?
- [ ] URL 끝에 슬래시(`/`)가 없는가?
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바른 anon 키인가?
- [ ] 따옴표나 공백이 없는가?
- [ ] 파일이 프로젝트 루트에 있는가?

### 4. 개발 서버 재시작

환경 변수를 변경한 후 **반드시** 개발 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

### 5. 환경 변수 로드 확인

개발 서버를 시작할 때 콘솔에 환경 변수가 로드되었는지 확인하세요.

---

## 🔍 추가 디버깅

### 환경 변수 확인 스크립트

임시로 다음 파일을 만들어 테스트할 수 있습니다:

`app/test-env/page.tsx` (임시 테스트용):

```tsx
export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1>Environment Variables Test</h1>
      <pre>
        {JSON.stringify(
          {
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
          },
          null,
          2
        )}
      </pre>
    </div>
  )
}
```

이 페이지를 방문하여 환경 변수가 제대로 로드되는지 확인하세요.

---

## 📝 올바른 .env.local 예시

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.abcdefghijklmnopqrstuvwxyz1234567890
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4OTY3MjgwLCJleHAiOjE5NTQ1NDMyODB9.abcdefghijklmnopqrstuvwxyz1234567890

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ⚠️ 주의사항

1. **환경 변수 이름**: `NEXT_PUBLIC_`로 시작하는 변수만 클라이언트에서 접근 가능합니다.
2. **서버 재시작**: `.env.local` 파일을 수정한 후 반드시 서버를 재시작하세요.
3. **따옴표**: 환경 변수 값에 따옴표를 사용하지 마세요.
4. **공백**: 등호(`=`) 앞뒤에 공백이 없어야 합니다.

