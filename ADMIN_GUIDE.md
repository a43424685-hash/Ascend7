# Admin 관리자 가이드

## 🔐 Admin 접근

### URL
```
http://localhost:3004/admin
```

프로덕션: `https://yourdomain.com/admin`

---

## 📋 기능 목록

### 1. Dashboard (`/admin`)
- Products 관리 바로가기
- Orders 조회 바로가기

### 2. Products 관리 (`/admin/products`)
- 전체 제품 목록 조회
- 제품 상태 (Active/Inactive) 확인
- Variants 수 및 재고 확인
- 제품 생성/수정

### 3. 제품 생성 (`/admin/products/new`)
- 제품 정보 입력
  - Name (제품명)
  - Slug (URL용)
  - Description (설명)
  - Category (카테고리: top/bottom/accessories)
  - Active (활성화 상태)

### 4. 제품 수정 (`/admin/products/[id]`)
- 제품 정보 수정
- 이미지 업로드/삭제
- Variants 추가/삭제

---

## 🆕 제품 생성 가이드

### Step 1: 제품 기본 정보 입력
1. `/admin/products` 페이지에서 **"+ New Product"** 클릭
2. 필수 정보 입력:
   - **Product Name**: 제품 이름 (예: Training Gloves)
   - **Slug**: URL에 사용 (자동 생성, 수정 가능)
   - **Description**: 제품 설명
   - **Category**: Top / Bottom / Accessories 선택
   - **Active**: 체크 시 고객에게 표시
3. **"Create Product"** 클릭

### Step 2: 이미지 업로드
1. 제품 생성 후 자동으로 제품 수정 페이지로 이동
2. **Product Images** 섹션에서 **"+ Upload Image"** 클릭
3. 이미지 파일 선택 (JPG, PNG, WebP / 최대 5MB)
4. 업로드된 이미지는 자동으로 Supabase Storage에 저장
5. 여러 이미지 추가 가능 (#1, #2, #3 순서로 표시)
6. 첫 번째 이미지가 메인 이미지로 사용됨

**이미지 삭제:**
- 이미지 위에 마우스 오버 → "Delete" 버튼 클릭

### Step 3: Variants 추가
1. **Variants** 섹션에서 **"+ Add Variant"** 클릭
2. Variant 정보 입력:
   - **SKU**: 재고 관리 코드 (예: TG-BLK-M)
   - **Color**: 색상 (예: Black)
   - **Size**: 사이즈 (예: M, L, XL, One Size)
   - **Price**: 가격 (원화)
   - **Stock**: 재고 수량
   - **Active**: 체크 시 판매 가능
3. **"Add Variant"** 클릭
4. 필요한 모든 컬러/사이즈 조합 추가

**예시:**
```
SKU: TG-BLK-OS | Color: Black | Size: One Size | Price: 35000 | Stock: 100
SKU: TG-RED-OS | Color: Red | Size: One Size | Price: 35000 | Stock: 50
```

### Step 4: 확인
1. `/shop` 페이지에서 제품이 표시되는지 확인
2. 제품 클릭 → 이미지, 옵션, 재고 확인
3. 장바구니 추가 테스트

---

## 📝 제품 수정

### 제품 정보 수정
1. `/admin/products`에서 제품의 **"Edit"** 클릭
2. **Product Information** 섹션에서 정보 수정
3. **"Save Changes"** 클릭

### 제품 비활성화
- **Active** 체크박스 해제 → 고객에게 표시되지 않음
- Variants가 있어도 제품이 비활성화되면 구매 불가

### Variants 수정
- 현재 MVP에서는 삭제만 가능
- 수정이 필요한 경우: 삭제 후 다시 생성

### Variants 삭제
1. Variant 행의 **"Delete"** 클릭
2. 확인 다이얼로그에서 OK
3. 삭제 시 주의: 해당 옵션으로 주문한 이력이 있을 수 있음

---

## 🔐 보안 (RLS 정책)

### 현재 설정
- **읽기 (SELECT)**: 모든 사용자 가능
- **쓰기 (INSERT/UPDATE/DELETE)**: 인증된 사용자만 가능

### RLS 정책 업데이트
`supabase-admin-rls.sql` 파일을 Supabase SQL Editor에서 실행:

```sql
-- Supabase 대시보드 → SQL Editor
-- supabase-admin-rls.sql 전체 내용 붙여넣기 → Run
```

### 프로덕션 권장사항
1. **Custom Claims 사용**
   - 특정 사용자만 admin 역할 부여
   - `user_metadata`에 `role: 'admin'` 추가

2. **RLS 정책 강화**
```sql
-- 예시: admin 역할을 가진 사용자만 수정 가능
CREATE POLICY "Admin users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );
```

3. **Admin 페이지 보호**
   - Middleware나 Layout에서 인증 확인
   - 비인증 사용자는 로그인 페이지로 리디렉션

---

## 📦 Supabase Storage 설정

### Storage 버킷 확인
1. Supabase 대시보드 → **Storage**
2. **product-images** 버킷 확인
3. 없으면 생성:
   - **"New bucket"** 클릭
   - Name: `product-images`
   - Public: ✅ (체크)
   - **"Create bucket"** 클릭

### Storage 정책
`supabase-admin-rls.sql`에 포함되어 있음:
- 모든 사용자가 이미지 조회 가능
- 인증된 사용자만 업로드/수정/삭제 가능

---

## 🐛 문제 해결

### 이미지 업로드 실패
**원인:** Storage 버킷이 없거나 권한 문제

**해결:**
1. Supabase 대시보드 → Storage 확인
2. `product-images` 버킷 생성
3. `supabase-admin-rls.sql` 실행

### Variants 추가 실패
**원인:** 중복된 SKU 또는 권한 문제

**해결:**
1. SKU는 전체 제품에서 고유해야 함
2. 다른 SKU로 다시 시도
3. `supabase-admin-rls.sql` 실행 확인

### 제품이 Shop에 표시되지 않음
**원인:** 
- 제품이 비활성화 상태
- Variants가 없음
- Variants가 모두 비활성화 상태

**해결:**
1. Admin에서 제품 **Active** 확인
2. 최소 1개 이상의 Active Variant 추가
3. 재고가 0이어도 표시는 됨 (Out of Stock)

### 제품 수정 시 "Failed to update"
**원인:** RLS 정책 미설정 또는 권한 문제

**해결:**
1. `supabase-admin-rls.sql` 파일 실행
2. Supabase 대시보드에서 RLS 정책 확인
3. 개발 서버 재시작

---

## 📊 권장 워크플로우

### 신규 제품 등록
1. 제품 기본 정보 입력 및 생성
2. 제품 이미지 업로드 (최소 1개, 권장 3-5개)
3. 모든 색상/사이즈 조합의 Variants 추가
4. 재고 수량 설정
5. Shop 페이지에서 확인
6. 테스트 구매 진행

### 재고 관리
1. `/admin/products`에서 제품 선택
2. Variants 섹션에서 재고 확인
3. 재고 부족 시:
   - 기존 Variant 삭제 후 새 재고로 다시 생성 (MVP)
   - 또는 직접 Supabase 대시보드에서 수정

### 시즌 종료 제품
1. 제품 Edit 페이지 이동
2. **Active** 체크 해제
3. 고객에게 표시되지 않지만 데이터는 보존됨
4. 필요 시 다시 활성화 가능

---

## 🚀 향후 개선 사항

- [ ] Variants 인라인 수정 기능
- [ ] 대량 이미지 업로드
- [ ] 이미지 순서 변경 (드래그 앤 드롭)
- [ ] 제품 복제 기능
- [ ] 재고 히스토리 추적
- [ ] CSV 일괄 업로드/다운로드
- [ ] Admin 인증 및 권한 관리
- [ ] 주문 관리 기능 확장

---

## 📚 참고

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

