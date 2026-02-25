# 🚀 관리자 주문 관리 시스템 설정 가이드

## 📋 목차
1. [개요](#개요)
2. [DB 스키마 적용](#db-스키마-적용)
3. [관리자 계정 생성](#관리자-계정-생성)
4. [Vercel 환경 변수 업데이트](#vercel-환경-변수-업데이트)
5. [기능 확인](#기능-확인)
6. [문제 해결](#문제-해결)

---

## 🎯 개요

이 업데이트는 관리자가 주문을 효율적으로 관리할 수 있는 완전한 시스템을 제공합니다:

### ✨ 주요 기능
- ✅ **결제/배송 상태 분리 관리** (payment_status / fulfillment_status)
- ✅ **고객 정보 자동 저장** (이름, 이메일, 배송지)
- ✅ **운송장 입력 및 배송 추적**
- ✅ **주문 취소 + 재고 자동 복구**
- ✅ **Supabase Auth 기반 관리자 권한**
- ✅ **RLS로 보안 강화**

---

## 📦 DB 스키마 적용

### 1단계: Supabase Dashboard SQL Editor 열기

1. https://supabase.com/dashboard 로그인
2. ITERO7 프로젝트 선택
3. 좌측 메뉴 → **SQL Editor** 클릭

### 2단계: SQL 스크립트 실행

`supabase-admin-orders-enhancement.sql` 파일의 전체 내용을 복사해서 붙여넣고 **RUN** 버튼 클릭!

```sql
-- =====================================================
-- 관리자 주문 관리 시스템 DB 스키마 확장
-- =====================================================
-- (파일 전체 내용을 여기에 붙여넣기)
```

### 3단계: 적용 확인

성공하면 다음 메시지가 표시됩니다:
```
✅ 관리자 주문 관리 시스템 DB 설정 완료!

📝 다음 단계:
1. 관리자 계정 생성: SELECT make_user_admin('your-email@example.com');
2. Webhook 코드 업데이트 (shipping/customer 정보 저장)
3. Admin Orders UI 구현
```

---

## 👤 관리자 계정 생성

### 방법 1: SQL Editor에서 직접 생성 (추천)

1. Supabase SQL Editor에서 실행:

```sql
SELECT make_user_admin('your-email@example.com');
```

**결과:** `관리자 권한 부여 완료: your-email@example.com`

### 방법 2: 수동으로 profiles 테이블 수정

1. Supabase Dashboard → **Table Editor** → `profiles` 테이블
2. 해당 사용자의 `role` 컬럼을 `user` → `admin`으로 변경

### ⚠️ 중요: 관리자 계정이 없으면?

**먼저 Supabase Auth로 사용자를 생성해야 합니다:**

```sql
-- 1. Authentication → Users에서 수동으로 사용자 추가
-- 또는 앱에서 회원가입

-- 2. 해당 이메일로 관리자 권한 부여
SELECT make_user_admin('admin@example.com');
```

---

## 🌐 Vercel 환경 변수 업데이트

코드가 Vercel에 배포되면 환경 변수가 **자동으로 적용**됩니다!

기존 환경 변수가 모두 설정되어 있다면 **추가 작업 불필요**합니다:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ 기능 확인

### 1. 로그인

관리자 계정으로 로그인합니다.

```
http://localhost:3000
또는
https://your-app.vercel.app
```

### 2. Admin Orders 페이지 접속

```
http://localhost:3000/admin/orders
```

### 3. 확인할 기능

#### ✅ 주문 목록
- 결제 상태 (💳 결제 완료, 결제 대기 등)
- 배송 상태 (📦 미처리, 처리 중, 배송 중, 배송 완료)
- 고객 이메일
- 주문 금액
- 생성일

#### ✅ 상세 보기 (각 주문의 "상세" 버튼 클릭)
- **주문 상품 목록** (제품명, 옵션, 수량, 금액)
- **고객 정보** (이름, 이메일, User ID)
- **배송지** (주소, 도시, 우편번호, 국가)
- **배송 상태 변경** (미처리 → 처리 중 → 배송 중 → 배송 완료)
- **운송장 입력** (택배사, 운송장 번호 → 자동으로 "배송 중"으로 변경)
- **주문 취소** (재고 자동 복구)

### 4. 테스트 시나리오

#### 시나리오 1: 정상 주문 처리
1. 새 주문 생성 (Shop → 상품 선택 → 결제)
2. Admin Orders에서 주문 확인
3. 배송 상태: "미처리" → "처리 중"
4. 운송장 입력 (예: CJ대한통운, 123456789)
5. 배송 상태 자동 변경: "배송 중"
6. 배송 완료 후: "배송 완료"

#### 시나리오 2: 주문 취소
1. Admin Orders에서 주문 선택
2. "주문 취소 (재고 복구)" 버튼 클릭
3. 확인 → 재고 자동 복구 + 배송 상태 "취소됨"

---

## 🐛 문제 해결

### Q1. "Admin access required" 에러

**원인:** 관리자 권한이 없는 계정으로 접속

**해결:**
```sql
SELECT make_user_admin('your-email@example.com');
```

### Q2. "profile not found" 에러

**원인:** 사용자의 profile이 생성되지 않음

**해결:**
```sql
-- 수동으로 profile 생성
INSERT INTO profiles (id, email, role)
VALUES (
  'user-uuid-from-auth.users',
  'your-email@example.com',
  'admin'
);
```

### Q3. orders 테이블에 새 컬럼이 없음

**원인:** SQL 마이그레이션이 제대로 실행되지 않음

**해결:**
1. Supabase Table Editor → `orders` 테이블 확인
2. 다음 컬럼들이 있어야 함:
   - `payment_status`
   - `fulfillment_status`
   - `tracking_number`
   - `carrier`
   - `shipping_address`
   - `customer_email`
   - `customer_name`
3. 없으면 SQL 스크립트 다시 실행

### Q4. RLS 정책 오류

**원인:** 기존 RLS 정책과 충돌

**해결:**
```sql
-- 기존 정책 모두 삭제 후 재생성
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "admin_read_orders" ON orders;
-- 그 후 SQL 스크립트 다시 실행
```

### Q5. Webhook에서 shipping 정보가 저장 안됨

**원인:** Stripe Checkout에서 shipping 정보를 수집하지 않음

**해결:**
1. `src/features/checkout/actions/create-checkout-session.ts` 확인
2. Stripe Checkout Session 생성 시 `shipping_address_collection` 옵션 추가:

```typescript
const session = await stripe.checkout.sessions.create({
  // ... 기존 설정
  shipping_address_collection: {
    allowed_countries: ['KR', 'US'],  // 배송 가능 국가
  },
})
```

---

## 📚 추가 리소스

- [Supabase Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Checkout Session API](https://stripe.com/docs/api/checkout/sessions)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## 🎉 완료!

이제 관리자 주문 관리 시스템이 완전히 설정되었습니다!

**다음 단계:**
1. Git Push
2. Vercel 자동 배포 확인
3. 프로덕션에서 테스트

문제가 있으면 로그를 확인하거나 이슈를 남겨주세요! 🚀

