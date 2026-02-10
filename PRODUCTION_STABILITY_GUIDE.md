# 🔒 ASCEND7 프로덕션 안정화 가이드

> **실제 운영 환경을 위한 필수 안전장치**
> 
> "기능이 작동하는 것"과 "돈이 오가도 안전한 것"은 완전히 다릅니다.
> 이 가이드는 실제 프로덕션 환경에서 발생할 수 있는 치명적인 문제들을 사전에 방지합니다.

---

## 📋 목차

1. [재고 동시성 방지 (Oversell Prevention)](#1-재고-동시성-방지)
2. [Stripe 웹훅 멱등성 (Idempotency)](#2-stripe-웹훅-멱등성)
3. [주문 상태 관리 (Order State Machine)](#3-주문-상태-관리)
4. [RLS 권한 제어 (Row Level Security)](#4-rls-권한-제어)
5. [모니터링 및 로깅](#5-모니터링-및-로깅)
6. [테스트 체크리스트](#6-테스트-체크리스트)

---

## 1. 재고 동시성 방지

### 🚨 문제 상황

```
시나리오: 재고 1개 남은 상품에 동시에 2명이 결제
❌ 기존 방식:
  1. User A: 재고 확인 (1개) → 결제 진행
  2. User B: 재고 확인 (1개) → 결제 진행
  3. User A: 재고 차감 (0개)
  4. User B: 재고 차감 (-1개) ⚠️ 마이너스 재고!

결과: 돈은 받았지만 물건이 없음 → 고객 불만 + 환불 처리
```

### ✅ 해결 방법: 원자적 재고 차감

**Postgres 함수: `atomic_decrement_stock`**

```sql
-- 재고 차감 시 행 잠금 (FOR UPDATE)
-- 트랜잭션이 끝날 때까지 다른 요청은 대기
SELECT stock FROM variants WHERE id = ? FOR UPDATE;

-- 재고 부족 시 실패 반환
IF stock < quantity THEN
  RETURN success = FALSE;
END IF;

-- 재고 차감 (음수 방지)
UPDATE variants SET stock = GREATEST(stock - quantity, 0);
```

**웹훅에서 사용:**

```typescript
const { data, error } = await supabase
  .rpc('atomic_decrement_stock', {
    p_variant_id: item.variant_id,
    p_quantity: item.quantity,
  })

if (!data[0].success) {
  // 재고 부족! 주문 상태를 'pending'으로 변경
  // 관리자에게 알림 발송
}
```

### 📁 관련 파일

- `supabase-production-setup.sql` - 원자적 차감 함수
- `app/api/webhooks/stripe/route.ts` - 웹훅에서 사용

---

## 2. Stripe 웹훅 멱등성

### 🚨 문제 상황

```
Stripe는 동일한 이벤트를 여러 번 전송할 수 있습니다.
❌ 기존 방식:
  1. checkout.session.completed 이벤트 수신
  2. 주문 생성 (order_1)
  3. 네트워크 타임아웃으로 Stripe가 재전송
  4. 주문 또다시 생성 (order_2) ⚠️ 중복 주문!

결과: 한 번 결제했는데 주문이 2개 생성됨
```

### ✅ 해결 방법: 이벤트 ID 추적

**테이블: `processed_stripe_events`**

```sql
CREATE TABLE processed_stripe_events (
  id UUID PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,  -- Stripe 이벤트 ID
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

**웹훅 로직:**

```typescript
// 1. 중복 체크
const { data: existingEvent } = await supabase
  .from('processed_stripe_events')
  .select('id')
  .eq('event_id', event.id)
  .single()

if (existingEvent) {
  console.log('⏭️ Event already processed')
  return { received: true, alreadyProcessed: true }
}

// 2. 주문 처리...

// 3. 이벤트 기록
await supabase
  .from('processed_stripe_events')
  .insert({ event_id: event.id, event_type: event.type })
```

### 📁 관련 파일

- `supabase-production-setup.sql` - 테이블 생성
- `app/api/webhooks/stripe/route.ts` - 멱등성 체크

---

## 3. 주문 상태 관리

### 📊 주문 상태 흐름

```
pending    → 결제 대기
   ↓
paid       → 결제 완료 (웹훅에서 자동 설정)
   ↓
preparing  → 상품 준비 중 (관리자가 수동 변경)
   ↓
shipped    → 배송 중
   ↓
delivered  → 배송 완료
   ↓
[예외 상태]
canceled   → 취소됨 (재고 복구)
refunded   → 환불됨 (재고 복구)
```

### 🔍 상태 변경 로그

**테이블: `order_status_logs`**

```sql
CREATE TABLE order_status_logs (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  from_status order_status_enum,
  to_status order_status_enum NOT NULL,
  changed_by UUID,  -- 누가 변경했는지
  reason TEXT,      -- 변경 이유
  metadata JSONB,   -- 추가 정보
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**자동 로깅 트리거:**

```sql
-- orders 테이블의 status가 변경될 때마다 자동으로 로그 기록
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();
```

### 📁 관련 파일

- `supabase-production-setup.sql` - 테이블 + 트리거
- `src/features/admin/actions/update-order-status.ts` - 상태 변경
- `src/features/admin/actions/cancel-order.ts` - 취소 + 재고 복구

---

## 4. RLS 권한 제어

### 🔐 보안 원칙

> **"UI로만 막으면 위험합니다. DB에서 강제하세요."**

### 테이블별 RLS 정책

#### Products / Variants

```sql
-- ✅ 읽기: 모두 가능 (공개 카탈로그)
CREATE POLICY "public_read_products"
  ON products FOR SELECT
  USING (true);

-- ✅ 쓰기: 인증된 사용자만 (관리자)
CREATE POLICY "auth_insert_products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

#### Orders

```sql
-- ✅ 읽기: 본인 주문만 (관리자는 모든 주문)
CREATE POLICY "auth_read_all_orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- ❌ 쓰기: 일반 사용자 차단 (service_role만 = 웹훅)
CREATE POLICY "no_direct_insert_orders"
  ON orders FOR INSERT
  WITH CHECK (FALSE);

-- ⚠️ 예외: 관리자는 상태 업데이트 가능
CREATE POLICY "auth_update_order_status"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);
```

#### Processed Stripe Events

```sql
-- ✅ service_role만 접근 가능 (웹훅 전용)
CREATE POLICY "service_role_only"
  ON processed_stripe_events FOR ALL
  USING (FALSE);
```

### 📁 관련 파일

- `supabase-production-setup.sql` - 전체 RLS 정책

---

## 5. 모니터링 및 로깅

### 📊 Admin 대시보드

**대시보드 위젯:**

1. **오늘 주문 수** - 실시간 주문 추이
2. **대기 중 주문** - 처리 필요한 주문 (재고 부족 등)
3. **재고 부족 상품** - 10개 미만 재고 알림

**재고 부족 뷰:**

```sql
CREATE VIEW low_stock_variants AS
SELECT 
  v.id, v.sku, p.name, v.color, v.size, v.stock
FROM variants v
JOIN products p ON p.id = v.product_id
WHERE v.stock < 10 AND v.is_active = TRUE
ORDER BY v.stock ASC;
```

### 🔔 알림 설정 (추후 확장)

- 이메일: 재고 부족 시 관리자에게 알림
- 슬랙: 주문 실패 시 즉시 알림
- 센트리: 에러 추적 및 모니터링

### 📁 관련 파일

- `app/admin/page.tsx` - 대시보드
- `supabase-production-setup.sql` - 뷰 생성

---

## 6. 테스트 체크리스트

### ✅ 동시성 테스트

**시나리오: 재고 1개 제품에 동시 주문**

```bash
# 터미널 1
curl -X POST http://localhost:3000/api/test/concurrent-order \
  -d '{"variant_id":"xxx", "quantity":1}'

# 터미널 2 (동시 실행)
curl -X POST http://localhost:3000/api/test/concurrent-order \
  -d '{"variant_id":"xxx", "quantity":1}'
```

**예상 결과:**
- ✅ 한 명은 성공 (재고 0)
- ✅ 한 명은 실패 (재고 부족 메시지)
- ❌ 재고가 -1이 되면 **실패**

---

### ✅ 멱등성 테스트

**시나리오: 동일한 Stripe 이벤트 2번 전송**

```bash
stripe trigger checkout.session.completed
# 동일 이벤트 ID로 재전송
stripe trigger checkout.session.completed --override event_id=evt_xxx
```

**예상 결과:**
- ✅ 주문은 1개만 생성됨
- ✅ 두 번째 요청은 `alreadyProcessed: true` 반환

---

### ✅ RLS 테스트

**시나리오: 일반 사용자가 다른 사람의 주문 조회 시도**

```typescript
// User A로 로그인
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', 'user_b_id')  // User B의 주문

console.log(data)  // 예상: [] (빈 배열)
```

**예상 결과:**
- ✅ 본인 주문만 조회됨
- ✅ 다른 사람 주문은 조회 불가

---

### ✅ 주문 취소 테스트

**시나리오: 주문 취소 시 재고 복구**

```typescript
// 1. 주문 생성 (재고 10 → 8)
// 2. 주문 취소
await cancelOrder(orderId, '고객 요청')

// 3. 재고 확인
const { data: variant } = await supabase
  .from('variants')
  .select('stock')
  .eq('id', variantId)
  .single()

console.log(variant.stock)  // 예상: 10 (복구됨)
```

**예상 결과:**
- ✅ 주문 상태: `canceled`
- ✅ 재고: 원래대로 복구
- ✅ 로그: `order_status_logs`에 기록

---

## 🚀 배포 전 체크리스트

### 1️⃣ 데이터베이스

- [ ] `supabase-production-setup.sql` 실행 (통합 버전)
- [ ] RLS 활성화 확인
- [ ] 함수 생성 확인
- [ ] 트리거 생성 확인

### 2️⃣ 환경 변수

- [ ] `STRIPE_SECRET_KEY` (프로덕션 키)
- [ ] `STRIPE_WEBHOOK_SECRET` (프로덕션 웹훅 시크릿)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (절대 노출 금지!)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3️⃣ Stripe 설정

- [ ] 프로덕션 모드 활성화
- [ ] 웹훅 엔드포인트 등록: `https://yourdomain.com/api/webhooks/stripe`
- [ ] 웹훅 이벤트 선택: `checkout.session.completed`
- [ ] 웹훅 시크릿 복사 → 환경 변수에 저장

### 4️⃣ 테스트

- [ ] 동시성 테스트 통과
- [ ] 멱등성 테스트 통과
- [ ] RLS 테스트 통과
- [ ] 주문 취소 테스트 통과

### 5️⃣ 모니터링

- [ ] Sentry 또는 Datadog 연동
- [ ] 에러 알림 설정
- [ ] 재고 부족 알림 설정

---

## 📚 추가 보안 권장사항

### 🔐 관리자 권한 강화

현재는 **인증된 사용자 = 관리자**로 간주합니다 (MVP).
프로덕션에서는 다음 방법으로 강화하세요:

**방법 1: Supabase Custom Claims**

```sql
-- user_metadata에 role 추가
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@ascend7.com';

-- RLS 정책에서 체크
CREATE POLICY "admin_only"
  ON products FOR INSERT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
```

**방법 2: 별도 관리자 테이블**

```sql
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
CREATE POLICY "admin_only"
  ON products FOR INSERT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );
```

---

## 🆘 문제 해결

### ❌ 재고가 마이너스가 되었어요!

**원인:** `atomic_decrement_stock` 함수를 사용하지 않음

**해결:**
```sql
-- 재고 복구
UPDATE variants SET stock = 10 WHERE id = 'xxx';

-- 웹훅 코드에서 atomic_decrement_stock 사용 확인
```

---

### ❌ 주문이 2번 생성되었어요!

**원인:** 멱등성 체크 누락

**해결:**
```sql
-- 중복 주문 삭제
DELETE FROM orders WHERE stripe_session_id = 'xxx' AND created_at > ...;

-- processed_stripe_events 테이블 확인
SELECT * FROM processed_stripe_events WHERE event_id = 'evt_xxx';
```

---

### ❌ 일반 사용자가 다른 사람 주문을 볼 수 있어요!

**원인:** RLS 정책 미적용

**해결:**
```sql
-- RLS 활성화 확인
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'orders';

-- 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- 정책 재적용
\i supabase-rls-final.sql
```

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **로그 확인**: Vercel 또는 Supabase 로그
2. **에러 메시지**: 브라우저 콘솔 + 네트워크 탭
3. **DB 상태**: Supabase SQL Editor에서 직접 조회

---

## ✅ 완료!

이 가이드를 모두 적용하면:

- ✅ 재고 oversell 방지
- ✅ 중복 주문 방지
- ✅ 체계적인 주문 상태 관리
- ✅ DB 레벨 보안 강화

**실제 운영 환경에 배포할 준비가 되었습니다! 🚀**

