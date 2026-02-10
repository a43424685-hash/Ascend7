# ⚡ 안정화 빠른 적용 가이드

> 프로덕션 배포 전 **반드시** 실행해야 할 작업들

---

## 🎯 1단계: SQL 실행 (Supabase Dashboard)

### ✅ 프로덕션 설정 (통합 버전)

```bash
# Supabase Dashboard → SQL Editor
# supabase-production-setup.sql 전체 복사 → 붙여넣기 → Run
```

**이 파일 하나로 모든 설정 완료:**
- ✅ `atomic_decrement_stock` 함수 생성
- ✅ `atomic_restore_stock` 함수 생성
- ✅ `processed_stripe_events` 테이블 생성
- ✅ `order_status_logs` 테이블 생성
- ✅ `order_status_enum` 타입 업데이트
- ✅ 모든 테이블 RLS 활성화
- ✅ Orders: 일반 사용자 직접 생성 차단
- ✅ Order Items: 본인 주문만 조회
- ✅ Processed Events: service_role만 접근

**예상 결과:**
```
Success. No rows returned
```

**오류 발생 시:**
- 기존 `supabase-schema.sql`이 실행되어 있어야 합니다
- 오류 메시지를 확인하고 문제 해결 섹션 참조

---

## 🔑 2단계: 환경 변수 확인

```bash
# .env.local 또는 Vercel 환경 변수

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ⚠️ 절대 공개하지 마세요!

STRIPE_SECRET_KEY=sk_live_...  # 프로덕션 키
STRIPE_WEBHOOK_SECRET=whsec_...  # 프로덕션 웹훅 시크릿
```

---

## 🔌 3단계: Stripe 웹훅 설정

### Stripe Dashboard

1. **Developers → Webhooks** 클릭
2. **Add endpoint** 클릭
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. **Events to send**: `checkout.session.completed` 선택
5. **Add endpoint** 클릭
6. **Signing secret** 복사 → 환경 변수에 저장

---

## 🧪 4단계: 테스트

### 테스트 1: 재고 동시성

```bash
# 재고 1개 제품에 동시 주문 시도
# 예상: 한 명만 성공, 한 명은 실패
```

### 테스트 2: 멱등성

```bash
# Stripe CLI로 동일 이벤트 2번 전송
stripe trigger checkout.session.completed

# 예상: 주문 1개만 생성
```

### 테스트 3: RLS

```bash
# 일반 사용자가 다른 사람 주문 조회 시도
# 예상: 조회 불가
```

### 테스트 4: 주문 취소

```bash
# Admin에서 주문 취소
# 예상: 재고 복구됨
```

---

## 📊 5단계: Admin 대시보드 확인

### 접속

```
https://yourdomain.com/admin
```

### 확인 사항

- [ ] 오늘 주문 수 표시
- [ ] 대기 중 주문 표시
- [ ] 재고 부족 상품 알림
- [ ] 주문 상태 변경 가능
- [ ] 주문 취소 (재고 복구) 가능

---

## ✅ 완료 체크리스트

### 데이터베이스

- [ ] `supabase-production-setup.sql` 실행 완료
- [ ] 모든 함수 생성 확인 (`atomic_decrement_stock`, `atomic_restore_stock`)
- [ ] 모든 테이블 생성 확인 (`processed_stripe_events`, `order_status_logs`)
- [ ] RLS 정책 적용 확인
- [ ] 트리거 생성 확인 (`order_status_change_trigger`)

### 환경 변수

- [ ] `SUPABASE_SERVICE_ROLE_KEY` 설정
- [ ] `STRIPE_SECRET_KEY` (프로덕션) 설정
- [ ] `STRIPE_WEBHOOK_SECRET` (프로덕션) 설정

### Stripe

- [ ] 프로덕션 모드 활성화
- [ ] 웹훅 엔드포인트 등록
- [ ] 웹훅 시크릿 복사
- [ ] 테스트 결제 성공

### 테스트

- [ ] 재고 동시성 테스트 통과
- [ ] 멱등성 테스트 통과
- [ ] RLS 테스트 통과
- [ ] 주문 취소 테스트 통과

---

## 🚨 주의사항

### ⚠️ 절대 하지 말아야 할 것

1. **`SUPABASE_SERVICE_ROLE_KEY`를 클라이언트 코드에 노출**
   - 오직 서버 사이드 코드에서만 사용
   - `.env.local`에 보관, 절대 커밋하지 말 것

2. **RLS 정책을 비활성화**
   - "테스트용"이라도 프로덕션에서 RLS 비활성화 금지

3. **웹훅 서명 검증 생략**
   - 반드시 `stripe.webhooks.constructEvent` 사용

4. **재고 차감 시 `atomic_decrement_stock` 미사용**
   - 직접 UPDATE 쿼리 사용 금지

---

## 🔍 확인 쿼리

### 재고 부족 상품 조회

```sql
SELECT 
  p.name, v.color, v.size, v.stock
FROM variants v
JOIN products p ON p.id = v.product_id
WHERE v.stock < 10 AND v.is_active = TRUE
ORDER BY v.stock ASC;
```

### 처리된 Stripe 이벤트 조회

```sql
SELECT * FROM processed_stripe_events
ORDER BY created_at DESC
LIMIT 10;
```

### 최근 주문 상태 변경 이력

```sql
SELECT 
  o.id AS order_id,
  o.total,
  osl.from_status,
  osl.to_status,
  osl.reason,
  osl.created_at
FROM order_status_logs osl
JOIN orders o ON o.id = osl.order_id
ORDER BY osl.created_at DESC
LIMIT 20;
```

---

## 📞 문제 발생 시

1. **에러 로그 확인**
   - Vercel: Dashboard → Logs
   - Supabase: Dashboard → Logs

2. **DB 상태 확인**
   ```sql
   -- RLS 활성화 확인
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **재고 복구 (긴급)**
   ```sql
   -- 특정 variant 재고 수동 복구
   UPDATE variants 
   SET stock = 100 
   WHERE id = 'xxx';
   ```

---

## ✅ 모두 완료하면

🎉 **프로덕션 배포 준비 완료!**

- ✅ 재고 oversell 방지
- ✅ 중복 주문 방지
- ✅ 체계적인 주문 관리
- ✅ DB 레벨 보안 강화

이제 실제 고객을 받을 준비가 되었습니다! 🚀

