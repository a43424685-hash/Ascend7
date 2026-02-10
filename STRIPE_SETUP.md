# Stripe 결제 연동 가이드

## 1. Stripe 계정 설정

### 1.1 Stripe 계정 생성
1. [Stripe 대시보드](https://dashboard.stripe.com/register) 접속
2. 계정 생성 (개발 시에는 테스트 모드 사용)

### 1.2 API 키 확인
1. Stripe 대시보드 → **Developers** → **API keys**
2. 다음 키를 복사:
   - **Publishable key** (pk_test_로 시작)
   - **Secret key** (sk_test_로 시작)

### 1.3 Webhook 설정
1. Stripe 대시보드 → **Developers** → **Webhooks**
2. **Add endpoint** 클릭
3. Endpoint URL 입력:
   - 로컬 개발: Stripe CLI 사용 (아래 참조)
   - 프로덕션: `https://yourdomain.com/api/webhooks/stripe`
4. 이벤트 선택: `checkout.session.completed`
5. **Add endpoint** 클릭
6. **Signing secret** (whsec_로 시작) 복사

---

## 2. 환경 변수 설정

`.env.local` 파일에 다음 내용 추가:

```bash
# Supabase (이미 설정됨)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 새로 추가

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

### Supabase Service Role Key 확인
1. Supabase 대시보드 → **Settings** → **API**
2. **Project API keys** 섹션에서 **service_role** 키 복사
3. ⚠️ **주의**: Service role key는 RLS를 우회하므로 절대 클라이언트에 노출하지 마세요!

---

## 3. 로컬 개발 시 Webhook 테스트

### 3.1 Stripe CLI 설치
```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Windows (Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# 또는 직접 다운로드
# https://github.com/stripe/stripe-cli/releases/latest
```

### 3.2 Stripe CLI 로그인
```bash
stripe login
```
브라우저에서 인증 완료

### 3.3 Webhook 포워딩 시작
```bash
stripe listen --forward-to localhost:3004/api/webhooks/stripe
```

출력된 `whsec_xxx` 값을 `.env.local`의 `STRIPE_WEBHOOK_SECRET`에 복사

### 3.4 개발 서버 실행
```bash
npm run dev
```

---

## 4. 테스트 결제

### 4.1 테스트 카드 번호
Stripe 테스트 모드에서 사용 가능한 카드:

| 카드 번호 | 결과 |
|----------|------|
| `4242 4242 4242 4242` | 성공 |
| `4000 0000 0000 9995` | 잔액 부족 실패 |
| `4000 0000 0000 0002` | 카드 거부 |

- **만료일**: 미래의 아무 날짜
- **CVC**: 아무 3자리 숫자
- **우편번호**: 아무 5자리 숫자

### 4.2 결제 플로우 테스트
1. 제품을 장바구니에 추가
2. `/checkout` 페이지로 이동
3. **PROCEED TO PAYMENT** 클릭
4. Stripe Checkout 페이지에서 테스트 카드 입력
5. 결제 완료 후 `/success` 페이지로 리디렉션
6. Webhook이 실행되어 주문 생성 및 재고 차감

### 4.3 확인 사항
- Supabase `orders` 테이블에 주문 생성 확인
- Supabase `order_items` 테이블에 주문 항목 확인
- `variants` 테이블의 `stock` 값 차감 확인
- 터미널에서 Webhook 이벤트 로그 확인

---

## 5. 프로덕션 배포

### 5.1 환경 변수 설정
Vercel/Netlify 등 배포 플랫폼에서 환경 변수 설정:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 비밀 유지)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (실제 키로 변경)
- `STRIPE_SECRET_KEY` (⚠️ 비밀 유지, 실제 키로 변경)
- `STRIPE_WEBHOOK_SECRET` (⚠️ 비밀 유지, 프로덕션 키로 변경)
- `NEXT_PUBLIC_APP_URL` (실제 도메인으로 변경)

### 5.2 Stripe 프로덕션 모드
1. Stripe 대시보드에서 **Test mode** → **Live mode** 전환
2. Live mode API 키 사용
3. Webhook을 프로덕션 URL로 설정

### 5.3 보안 체크리스트
- [ ] Service role key가 클라이언트 코드에 없는지 확인
- [ ] Webhook secret이 안전하게 저장되었는지 확인
- [ ] HTTPS를 사용하는지 확인
- [ ] RLS 정책이 올바르게 설정되었는지 확인

---

## 6. 트러블슈팅

### Webhook이 실행되지 않을 때
```bash
# Stripe CLI로 이벤트 확인
stripe events list

# 특정 이벤트 재전송
stripe events resend evt_xxx
```

### 주문이 생성되지 않을 때
1. 브라우저 개발자 도구 → Network 탭 확인
2. 터미널에서 서버 로그 확인
3. Stripe 대시보드 → Logs 확인
4. Supabase 대시보드 → Logs 확인

### 재고가 차감되지 않을 때
1. `variants` 테이블에 데이터가 있는지 확인
2. Webhook 로그에서 에러 확인
3. `order_items`가 정상적으로 생성되었는지 확인

---

## 7. 참고 자료

- [Stripe Checkout 문서](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks 가이드](https://stripe.com/docs/webhooks)
- [Stripe CLI 문서](https://stripe.com/docs/stripe-cli)
- [Stripe 테스트 카드](https://stripe.com/docs/testing)

