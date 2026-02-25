# ITERO7 Gymwear Commerce MVP

> Minimal, high-performance e-commerce site for ITERO7 gymwear brand.

Athletic. Sharp. Fast.

## 🚀 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Auth + Postgres + Storage)
- **Stripe Checkout**
- **Feature-Sliced Design** architecture

## ✨ 주요 기능

### 고객 기능
- ✅ 상품 카탈로그 (필터링 & 정렬)
- ✅ 상품 상세 페이지 (갤러리, 옵션 선택)
- ✅ 게스트 장바구니 (localStorage)
- ✅ Stripe Checkout 결제
- ✅ 주문 내역 조회

### 관리자 기능
- ✅ 상품 생성/수정/삭제
- ✅ 이미지 업로드 (Supabase Storage)
- ✅ Variant 관리 (색상/사이즈/재고)
- ✅ 주문 관리 (상태 변경)
- ✅ 주문 취소 (재고 자동 복구)
- ✅ 재고 부족 알림

### 🔒 프로덕션 안전장치
- ✅ **재고 동시성 제어** - Oversell 방지
- ✅ **웹훅 멱등성** - 중복 주문 방지
- ✅ **주문 상태 머신** - 체계적인 주문 관리
- ✅ **RLS 보안** - DB 레벨 권한 제어

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase & Stripe
상세한 설정 가이드를 참고하세요:
- [📘 빠른 시작 가이드](./QUICK_START.md) - **여기서 시작하세요!**
- [🗄️ Supabase 설정](./SUPABASE_SETUP.md)
- [💳 Stripe 설정](./STRIPE_SETUP.md)
- [⚙️ 환경 변수 가이드](./ENV_EXAMPLE.md)

### 3. Run Development Server
```bash
npm run dev
```

브라우저에서 [http://localhost:3004](http://localhost:3004) 접속

## 📖 문서

### 시작하기

- **[빠른 시작 가이드](./QUICK_START.md)** - 전체 설정 체크리스트
- **[Supabase 설정](./SUPABASE_SETUP.md)** - 데이터베이스 설정 가이드
- **[Stripe 설정](./STRIPE_SETUP.md)** - 결제 연동 가이드
- **[Admin 가이드](./ADMIN_GUIDE.md)** - 관리자 기능 사용법
- **[환경 변수](./ENV_EXAMPLE.md)** - 환경 변수 설정 상세 가이드
- **[문제 해결](./TROUBLESHOOTING.md)** - 자주 발생하는 문제 해결

### 🔒 프로덕션 배포

- **[⚡ 프로덕션 안정화 적용하기](./APPLY_STABILITY.md)** - **5분 완성! 먼저 보세요**
- **[🔒 프로덕션 안정화 가이드](./PRODUCTION_STABILITY_GUIDE.md)** - 상세 설명
- **[✅ 안정화 체크리스트](./STABILITY_CHECKLIST.md)** - 배포 전 체크리스트

## 📁 Project Structure

```
app/
├── page.tsx                    # 홈 (Featured 제품)
├── shop/page.tsx               # 제품 목록 + 필터/정렬
├── product/[slug]/page.tsx     # 제품 상세 (옵션 선택)
├── cart/page.tsx               # 장바구니
├── checkout/page.tsx           # 결제
├── success/page.tsx            # 결제 성공
├── cancel/page.tsx             # 결제 취소
├── admin/                      # 관리자 페이지
│   ├── page.tsx                # Admin 대시보드
│   ├── products/               # 제품 관리
│   └── orders/                 # 주문 관리
└── api/webhooks/stripe/        # Stripe Webhook

src/
├── entities/                   # 비즈니스 엔티티
│   ├── product/                # 제품 CRUD
│   ├── variant/                # Variants CRUD
│   ├── cart/                   # 장바구니 조회
│   └── order/                  # 주문 조회
├── features/                   # 기능 모듈
│   ├── cart/                   # 장바구니 관리 (localStorage)
│   └── checkout/               # Stripe Checkout Session
├── widgets/                    # UI 위젯
│   ├── header/                 # 헤더 (장바구니 아이콘)
│   ├── footer/                 # 푸터
│   ├── product-grid/           # 제품 그리드
│   ├── shop-filters/           # Shop 필터 UI
│   └── admin/                  # Admin 위젯
│       ├── product-edit-form/  # 제품 수정 폼
│       ├── variants-manager/   # Variants 관리
│       └── images-manager/     # 이미지 업로드
└── shared/                     # 공유 리소스
    ├── api/                    # Supabase 클라이언트
    ├── lib/                    # 유틸리티 (Stripe 등)
    ├── types/                  # 타입 정의
    └── ui/                     # 재사용 UI 컴포넌트
```

## ✨ Features

### 완성된 기능
- ✅ 제품 카탈로그 (카테고리/컬러/사이즈 필터)
- ✅ 제품 상세 (이미지 갤러리, 옵션 선택, 재고 확인)
- ✅ 게스트 장바구니 (localStorage 기반)
- ✅ Stripe Checkout 결제
- ✅ Webhook으로 주문 생성 & 재고 차감
- ✅ 주문 성공/취소 페이지
- ✅ **Admin 관리자 페이지**
  - 제품 생성/수정 (이름, 설명, 카테고리)
  - 이미지 업로드/삭제 (Supabase Storage)
  - Variants 관리 (색상/사이즈/가격/재고)
  - RLS 정책으로 권한 관리

### 추가 예정
- ⬜ 사용자 인증 (Supabase Auth)
- ⬜ 주문 내역 페이지
- ⬜ Admin 주문 관리 기능
- ⬜ 제품 리뷰
- ⬜ 이메일 알림

## 🧪 테스트

### 테스트 결제
Stripe 테스트 카드: `4242 4242 4242 4242`
- 만료일: 미래의 아무 날짜
- CVC: 아무 3자리 숫자

전체 테스트 가이드: [QUICK_START.md](./QUICK_START.md#-기능-테스트)

## 🐛 문제 해결

문제가 발생하면 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참고하세요.

자주 발생하는 문제:
- Supabase 연결 오류 → URL 형식 확인
- Stripe Checkout 실패 → 환경 변수 확인
- Webhook 미작동 → Stripe CLI 실행 확인

## 📞 Support

문제가 계속되면 다음을 확인하세요:
1. `.env.local` 파일이 올바른지 확인
2. 개발 서버 재시작 (`npm run dev`)
3. 브라우저 개발자 도구 → Console 확인
4. [문제 해결 가이드](./TROUBLESHOOTING.md) 참고

## 📄 License

Private

