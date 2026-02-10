# 🗄️ 데이터베이스 설정 가이드

## 📋 단계별 설정

### 1단계: 스키마 생성

1. **Supabase 대시보드 접속**
   - https://supabase.com → Ascend7 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 **SQL Editor** 클릭
   - **New query** 버튼 클릭

3. **스키마 실행**
   - `supabase-schema.sql` 파일 열기
   - **전체 내용 복사** (Ctrl+A, Ctrl+C)
   - SQL Editor에 **붙여넣기** (Ctrl+V)
   - **Run** 버튼 클릭 (또는 `Ctrl+Enter`)

4. **성공 확인**
   - "Success. No rows returned" 메시지 확인
   - Table Editor에서 다음 테이블 확인:
     - ✅ `products`
     - ✅ `product_images`
     - ✅ `variants`
     - ✅ `orders`
     - ✅ `order_items`

### 2단계: 시드 데이터 삽입

1. **SQL Editor에서 새 쿼리 열기**

2. **시드 데이터 실행**
   - `supabase-seed.sql` 파일 열기
   - **전체 내용 복사**
   - SQL Editor에 **붙여넣기**
   - **Run** 버튼 클릭

3. **데이터 확인**
   - Table Editor에서 `products` 테이블 확인
   - 3개 제품이 생성되었는지 확인:
     - Premium Tank Top
     - Athletic Performance Shorts
     - Training Gloves

4. **확인 쿼리 실행** (선택사항)
   ```sql
   SELECT 
     p.name,
     p.category,
     COUNT(DISTINCT v.id) as variant_count,
     MIN(v.price) as min_price,
     MAX(v.price) as max_price,
     SUM(v.stock) as total_stock,
     COUNT(DISTINCT pi.id) as image_count
   FROM products p
   LEFT JOIN variants v ON p.id = v.product_id AND v.is_active = true
   LEFT JOIN product_images pi ON p.id = pi.product_id
   WHERE p.is_active = true
   GROUP BY p.id, p.name, p.category
   ORDER BY p.created_at DESC;
   ```

### 3단계: RLS 정책 확인

스키마에 RLS 정책이 포함되어 있습니다:

- ✅ **products**: 모든 사용자가 활성화된 제품 조회 가능
- ✅ **product_images**: 제품과 연결된 이미지 조회 가능
- ✅ **variants**: 활성화된 변형만 조회 가능
- ✅ **orders**: 사용자는 자신의 주문만 조회 가능

## 📊 데이터 구조

### Products (상품)
- `id`: UUID (자동 생성)
- `slug`: 고유 식별자 (URL에 사용)
- `name`: 제품명
- `description`: 설명
- `category`: 카테고리 (top, bottom, accessories)
- `is_active`: 활성화 여부

### Variants (변형)
- `id`: UUID
- `product_id`: 제품 ID (외래키)
- `sku`: 고유 SKU
- `color`: 색상
- `size`: 사이즈
- `price`: 가격 (원 단위)
- `stock`: 재고 수량
- `is_active`: 활성화 여부

### Product Images (이미지)
- `id`: UUID
- `product_id`: 제품 ID (외래키)
- `url`: 이미지 URL
- `sort_order`: 정렬 순서

## 🎯 중요한 포인트

### Shop 리스트 표시 로직

1. **제품 기준 조회**
   - `products` 테이블에서 `is_active = true`인 제품만 조회
   - 카테고리별 필터링 가능

2. **가격 계산**
   - 각 제품의 `variants`에서 최저가 계산
   - `ProductGrid` 컴포넌트에서:
     ```typescript
     const variantPrices = product.variants?.map((v) => v.price) || []
     const minPrice = Math.min(...variantPrices)
     ```

3. **재고 확인**
   - `variants`의 `stock` 합계로 재고 여부 판단
   - 품절 표시는 모든 variant의 stock이 0인 경우

### 데이터 흐름

```
products (제품 목록)
  ↓
variants (가격/재고 계산)
  ↓
product_images (이미지 표시)
  ↓
ProductGrid (카드 표시)
```

## ✅ 체크리스트

- [ ] `supabase-schema.sql` 실행 완료
- [ ] 5개 테이블 생성 확인
- [ ] RLS 정책 활성화 확인
- [ ] `supabase-seed.sql` 실행 완료
- [ ] 3개 제품 생성 확인
- [ ] 각 제품에 variants 존재 확인
- [ ] 각 제품에 이미지 존재 확인
- [ ] 홈 페이지에서 제품 표시 확인

## 🔧 문제 해결

### 문제 1: "relation does not exist"
- **해결**: `supabase-schema.sql`을 먼저 실행하세요

### 문제 2: "foreign key constraint"
- **해결**: 제품을 먼저 생성한 후 variants와 images를 추가하세요

### 문제 3: "duplicate key value"
- **해결**: 이미 데이터가 있는 경우, 기존 데이터를 삭제하거나 다른 slug 사용

### 문제 4: 제품이 표시되지 않음
- **해결**: 
  1. `is_active = true` 확인
  2. variants가 있는지 확인
  3. RLS 정책 확인
  4. 브라우저 콘솔에서 에러 확인

## 📝 다음 단계

1. 실제 제품 이미지 URL로 교체
2. 추가 제품 데이터 입력
3. 관리자 페이지에서 제품 관리 기능 구현

