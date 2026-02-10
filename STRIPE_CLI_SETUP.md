# Stripe CLI 설치 및 사용 가이드

## ✅ 설치 완료!

Stripe CLI가 성공적으로 설치되었습니다.

---

## 🔄 다음 단계

### 1. **새 터미널 열기**
설치 후 환경 변수가 업데이트되었으므로 **새 터미널을 열어야 합니다**.

#### 방법 1: VS Code / Cursor
- 터미널 탭 옆 `+` 버튼 클릭
- 또는 `Ctrl + Shift + ` (백틱)

#### 방법 2: PowerShell
- 시작 메뉴 → PowerShell 검색 → 새로 실행

---

### 2. **Stripe CLI 확인**
새 터미널에서 다음 명령어 실행:

```bash
stripe --version
```

**예상 출력:**
```
stripe version 1.35.0
```

---

### 3. **Stripe 로그인**

```bash
stripe login
```

**진행 과정:**
1. 브라우저가 자동으로 열립니다
2. Stripe 대시보드에 로그인
3. "Allow access" 클릭
4. 터미널에 성공 메시지 표시

**예상 출력:**
```
Your pairing code is: word-word-word
Press Enter to open the browser (^C to quit)

> Done! The Stripe CLI is configured for [계정명] with account id acct_xxxxx

Please note: this key will expire after 90 days, at which point you'll need to re-authenticate.
```

---

### 4. **Webhook 포워딩 시작**

**새 터미널 창을 하나 더 열고** 다음 명령어 실행:

```bash
stripe listen --forward-to localhost:3004/api/webhooks/stripe
```

**예상 출력:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

**중요!** 출력된 `whsec_xxxxxxxxxxxxxxxxxxxxx` 값을 복사하세요.

---

### 5. **환경 변수에 Webhook Secret 추가**

`.env.local` 파일을 열고 다음 줄을 추가/수정:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

(위에서 복사한 값으로 교체)

---

### 6. **개발 서버 재시작**

개발 서버가 실행 중인 터미널에서:
1. `Ctrl + C`로 서버 중지
2. `npm run dev`로 다시 시작

---

## 📋 터미널 구성 요약

총 **3개의 터미널**이 필요합니다:

### 터미널 1: 개발 서버
```bash
npm run dev
```
**상태:** 계속 실행 중

### 터미널 2: Stripe Webhook
```bash
stripe listen --forward-to localhost:3004/api/webhooks/stripe
```
**상태:** 계속 실행 중 (이벤트 수신 대기)

### 터미널 3: 일반 명령어
- 필요할 때 사용
- git, npm install 등

---

## 🧪 테스트

### 1. Webhook 연결 확인
터미널 2 (Stripe Webhook)에서 다음과 같은 메시지가 표시되어야 합니다:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

### 2. 테스트 결제
1. 브라우저에서 `http://localhost:3004` 접속
2. 제품을 장바구니에 추가
3. Checkout 페이지로 이동
4. 테스트 카드 정보 입력:
   - 카드 번호: `4242 4242 4242 4242`
   - 만료일: 미래의 아무 날짜 (예: 12/34)
   - CVC: 아무 3자리 (예: 123)
   - 우편번호: 아무 5자리 (예: 12345)
5. 결제 완료

### 3. Webhook 이벤트 확인
터미널 2에서 다음과 같은 로그가 표시되어야 합니다:
```
2024-01-01 12:00:00   --> checkout.session.completed [evt_xxxxx]
2024-01-01 12:00:00  <--  [200] POST http://localhost:3004/api/webhooks/stripe [evt_xxxxx]
```

### 4. 데이터베이스 확인
Supabase 대시보드에서:
- `orders` 테이블에 새 주문 생성 확인
- `order_items` 테이블에 주문 항목 확인
- `variants` 테이블의 `stock` 감소 확인

---

## ❌ 문제 해결

### "stripe: command not found"
**원인:** 터미널이 환경 변수를 업데이트하지 않음

**해결:**
1. 현재 터미널 완전히 닫기
2. VS Code / Cursor 재시작
3. 새 터미널 열기
4. `stripe --version` 재시도

### "Failed to verify webhook signature"
**원인:** `.env.local`의 `STRIPE_WEBHOOK_SECRET`이 잘못됨

**해결:**
1. 터미널 2에서 `whsec_xxx` 값 다시 복사
2. `.env.local` 파일 수정
3. 개발 서버 재시작 (`npm run dev`)

### Webhook 이벤트가 표시되지 않음
**원인:** Webhook 포워딩이 실행되지 않음

**해결:**
1. 터미널 2 확인: `stripe listen` 실행 중인지
2. 포트 확인: `localhost:3004`가 맞는지
3. 개발 서버 실행 중인지 확인

---

## 💡 팁

### Webhook 이벤트 재전송
테스트 중 이벤트를 다시 보내고 싶을 때:

```bash
stripe events resend evt_xxxxxxxxxxxxx
```

### Webhook 로그 확인
Stripe 대시보드에서도 확인 가능:
- Stripe 대시보드 → Developers → Webhooks → 엔드포인트 클릭 → Events

### 로컬 개발 vs 프로덕션
- **로컬 개발:** `stripe listen` 사용
- **프로덕션:** Stripe 대시보드에서 실제 Webhook URL 등록

---

## 📚 추가 자료

- [Stripe CLI 공식 문서](https://stripe.com/docs/stripe-cli)
- [Webhook 테스트 가이드](https://stripe.com/docs/webhooks/test)
- [Stripe 이벤트 목록](https://stripe.com/docs/api/events/types)

---

## ✅ 체크리스트

완료 여부를 확인하세요:

- [ ] Stripe CLI 설치 완료
- [ ] 새 터미널에서 `stripe --version` 성공
- [ ] `stripe login` 완료
- [ ] `stripe listen` 실행 중
- [ ] `whsec_xxx` 값을 `.env.local`에 추가
- [ ] 개발 서버 재시작
- [ ] 테스트 결제 성공
- [ ] Webhook 이벤트 수신 확인
- [ ] Supabase에 주문 생성 확인

모두 완료되면 Stripe 결제 연동이 완료된 것입니다! 🎉

