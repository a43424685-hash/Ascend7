# ⚡ 프로덕션 안정화 적용하기

> **5분이면 완료!** 통합 SQL 파일로 한 번에 설정

---

## 📋 준비물

- ✅ Supabase 프로젝트
- ✅ `supabase-schema.sql` 실행 완료 (기본 테이블 생성)
- ✅ `supabase-seed.sql` 실행 완료 (시드 데이터)

---

## 🚀 1단계: SQL 실행 (2분)

### 1. Supabase Dashboard 접속

```
https://app.supabase.com/project/YOUR_PROJECT_ID
```

### 2. SQL Editor 열기

좌측 메뉴 → **SQL Editor** 클릭

### 3. SQL 실행

1. `supabase-production-setup.sql` 파일 열기
2. **전체 내용** 복사 (Ctrl+A, Ctrl+C)
3. SQL Editor에 붙여넣기 (Ctrl+V)
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)

### 4. 성공 확인

```
Success. No rows returned
```

이 메시지가 보이면 성공! 🎉

---

## ❌ 오류 발생 시

### 오류 1: `relation "orders" does not exist`

**원인:** `supabase-schema.sql`이 실행되지 않음

**해결:**
1. `supabase-schema.sql` 먼저 실행
2. 다시 `supabase-production-setup.sql` 실행

---

### 오류 2: `policy "xxx" already exists`

**원인:** 이미 일부 정책이 존재함

**해결:**
- 무시하고 진행 가능 (중복 정책은 자동으로 삭제 후 재생성)
- 또는 수동 삭제:
  ```sql
  DROP POLICY IF EXISTS "policy_name" ON table_name;
  ```

---

### 오류 3: `type "order_status_enum" already exists`

**원인:** 이미 enum 타입이 존재함

**해결:**
- 무시하고 진행 가능 (`DROP TYPE IF EXISTS`로 자동 삭제)

---

## ✅ 2단계: 확인하기 (1분)

### 함수 생성 확인

```sql
-- Supabase SQL Editor에서 실행
SELECT proname FROM pg_proc WHERE proname LIKE 'atomic_%';
```

**예상 결과:**
```
atomic_decrement_stock
atomic_restore_stock
```

---

### 테이블 생성 확인

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('processed_stripe_events', 'order_status_logs');
```

**예상 결과:**
```
processed_stripe_events
order_status_logs
```

---

### RLS 활성화 확인

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('orders', 'order_items', 'processed_stripe_events');
```

**예상 결과:** 모든 테이블의 `rowsecurity`가 `t` (true)

---

## 🎯 3단계: 코드 배포 (2분)

### Vercel 배포

```bash
git add .
git commit -m "feat: 프로덕션 안정화 - 재고 동시성, 멱등성, RLS"
git push
```

Vercel이 자동으로 배포합니다.

---

### 환경 변수 확인

Vercel Dashboard에서 확인:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ⚠️ 필수!
STRIPE_WEBHOOK_SECRET=whsec_...      # 프로덕션 시크릿
```

---

## 🧪 4단계: 테스트 (선택)

### 테스트 1: 재고 동시성

```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM atomic_decrement_stock(
  'variant_id_여기에_입력'::uuid,
  1
);
```

**예상 결과:**
```
success | new_stock | error_message
true    | 9         | null
```

---

### 테스트 2: 주문 생성 (게스트)

1. 브라우저에서 상품 추가
2. 장바구니 확인
3. Checkout 진행
4. Stripe 테스트 카드: `4242 4242 4242 4242`
5. 결제 완료 확인

---

### 테스트 3: Admin 대시보드

```
https://yourdomain.com/admin
```

- [ ] 오늘 주문 수 표시
- [ ] 대기 중 주문 표시
- [ ] 재고 부족 알림 표시

---

## ✅ 완료!

이제 다음이 모두 적용되었습니다:

- ✅ **재고 동시성 방지** - Oversell 불가능
- ✅ **웹훅 멱등성** - 중복 주문 방지
- ✅ **주문 상태 관리** - 체계적인 상태 변경 이력
- ✅ **RLS 보안** - DB 레벨 권한 제어

**실제 고객을 받을 준비가 되었습니다! 🚀**

---

## 📚 추가 문서

- [🔒 프로덕션 안정화 가이드](./PRODUCTION_STABILITY_GUIDE.md) - 상세 설명
- [⚡ 안정화 체크리스트](./STABILITY_CHECKLIST.md) - 배포 전 체크리스트

---

## 🆘 도움이 필요하면

1. Supabase Logs 확인
2. Vercel Logs 확인
3. 브라우저 Console 확인
4. [문제 해결 가이드](./TROUBLESHOOTING.md) 참조

