# ASCEND7 빠른 시작 가이드

## 📋 체크리스트

전체 설정을 완료하려면 다음 단계를 순서대로 진행하세요.

### 1. ✅ 프로젝트 초기화
```bash
npm install
```

### 2. ✅ Supabase 설정
1. [Supabase](https://supabase.com) 계정 생성 및 프로젝트 생성
2. **Settings** → **API**에서 다음 정보 확인:
   - Project URL
   - anon public key
   - service_role key (⚠️ 비밀 유지)
3. **SQL Editor**에서 스키마 실행:
   ```bash
   # supabase-schema.sql 전체 내용 복사 → SQL Editor에 붙여넣기 → Run
   # supabase-seed.sql 전체 내용 복사 → SQL Editor에 붙여넣기 → Run
   ```

자세한 내용: `SUPABASE_SETUP.md` 참고

   ### 3. ✅ Stripe 설정
   1. [Stripe](https://dashboard.stripe.com/register) 계정 생성 (테스트 모드)
   2. **Developers** → **API keys**에서 키 확인:
      - Publishable key (pk_test_)
      - Secret key (sk_test_)
   3. Stripe CLI 설치 및 Webhook 포워딩:
      ```bash
      stripe login
      stripe listen --forward-to localhost:3004/api/webhooks/stripe
      ```

자세한 내용: `STRIPE_SETUP.md` 참고

### 4. ✅ 환경 변수 설정
프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

### 5. ✅ 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3004` 접속

---

## 🧪 기능 테스트

### 홈페이지 (/)
- [ ] Featured 제품 4개가 표시되는지 확인

### Shop 페이지 (/shop)
- [ ] 모든 제품이 표시되는지 확인
- [ ] 카테고리 필터 작동 확인
- [ ] 컬러/사이즈 필터 작동 확인
- [ ] 정렬 기능 작동 확인

### 제품 상세 (/product/[slug])
- [ ] 제품 이미지 갤러리 표시
- [ ] 컬러 선택 시 사이즈 옵션 변경
- [ ] 재고 확인
- [ ] 장바구니 추가 기능

### 장바구니 (/cart)
- [ ] 장바구니 아이템 표시
- [ ] 수량 변경 기능
- [ ] 아이템 삭제 기능
- [ ] 합계 계산

### 결제 (/checkout)
- [ ] 주문 요약 표시
- [ ] Stripe Checkout으로 리디렉션
- [ ] 테스트 카드로 결제: `4242 4242 4242 4242`
- [ ] 결제 성공 후 `/success`로 리디렉션

### 결제 성공 (/success)
- [ ] 주문 확인 메시지 표시
- [ ] 장바구니 자동 비우기
- [ ] Supabase `orders` 테이블에 주문 생성 확인
- [ ] `variants` 테이블의 재고 차감 확인

---

## 🐛 문제 해결

### "장바구니 데이터를 불러올 수 없습니다"
- `.env.local` 파일의 Supabase 설정 확인
- 브라우저 개발자 도구 → Console 확인
- `supabase-schema.sql`이 실행되었는지 확인

### "Checkout session creation failed"
- `.env.local` 파일의 Stripe 설정 확인
- `STRIPE_SECRET_KEY`가 `sk_test_`로 시작하는지 확인
- `NEXT_PUBLIC_APP_URL`이 올바른지 확인

### Webhook이 실행되지 않음
- Stripe CLI가 실행 중인지 확인
- `STRIPE_WEBHOOK_SECRET`이 Stripe CLI 출력값과 일치하는지 확인
- 개발 서버를 재시작

자세한 내용: `TROUBLESHOOTING.md` 참고

---

## 📁 프로젝트 구조

```
app/
├── page.tsx              # 홈페이지
├── shop/page.tsx         # 제품 목록
├── product/[slug]/       # 제품 상세
├── cart/page.tsx         # 장바구니
├── checkout/page.tsx     # 결제
├── success/page.tsx      # 결제 성공
└── api/webhooks/stripe/  # Stripe Webhook

src/
├── entities/             # 비즈니스 엔티티
│   ├── product/          # 제품 관련
│   ├── cart/             # 장바구니 관련
│   └── order/            # 주문 관련
├── features/             # 기능 모듈
│   ├── cart/             # 장바구니 기능
│   └── checkout/         # 결제 기능
├── widgets/              # UI 위젯
│   ├── header/           # 헤더
│   ├── footer/           # 푸터
│   └── product-grid/     # 제품 그리드
└── shared/               # 공유 리소스
    ├── api/              # API 클라이언트
    ├── lib/              # 유틸리티
    ├── types/            # 타입 정의
    └── ui/               # UI 컴포넌트
```

---

## 🚀 다음 단계

- [ ] 사용자 인증 추가 (Supabase Auth)
- [ ] 주문 내역 페이지 구현
- [ ] 관리자 페이지 구현
- [ ] 제품 리뷰 기능
- [ ] 이메일 알림 (주문 확인)
- [ ] SEO 최적화
- [ ] 프로덕션 배포

---

## 📚 문서

- [Supabase 설정](./SUPABASE_SETUP.md)
- [Stripe 설정](./STRIPE_SETUP.md)
- [문제 해결](./TROUBLESHOOTING.md)
- [데이터베이스 스키마](./supabase-schema.sql)
- [시드 데이터](./supabase-seed.sql)

