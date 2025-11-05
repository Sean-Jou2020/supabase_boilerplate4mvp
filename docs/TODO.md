# 쇼핑몰 MVP TODO (PRD 기반)

## Phase 1: 기본 인프라 (1주)

- [x] Next.js 프로젝트 셋업 완료 확인
  - [x] React 19 + Next.js 15 App Router
  - [x] TypeScript 설정 확인
  - [x] pnpm 패키지 매니저 사용
- [ ] 환경 변수 설정 완료
  - [ ] `.env` 파일 생성 및 설정
  - [ ] Vercel Project 환경 변수 설정
  - [ ] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY (서버 전용, 절대 노출 금지)
  - [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY
  - [ ] NEXT_PUBLIC_STORAGE_BUCKET=uploads
  - [ ] Toss Payments 관련 환경 변수 (테스트 모드)
- [ ] Supabase 프로젝트 생성 및 스키마 적용
  - [ ] `supabase/migrations/schema.sql` 실행 (users 테이블)
  - [ ] `supabase/migrations/update_shopping_mall_schema.sql` 실행
    - [ ] `products` 테이블 생성 (20개 샘플 데이터 포함)
    - [ ] `cart_items` 테이블 생성 (clerk_id 기반)
    - [ ] `orders` 테이블 생성 (status: pending/confirmed/shipped/delivered/cancelled)
    - [ ] `order_items` 테이블 생성
    - [ ] `update_updated_at_column()` 함수 생성
    - [ ] updated_at 트리거 등록
    - [ ] 인덱스 생성 (성능 최적화)
  - [ ] RLS 비활성화 확인 (PRD 제약사항: RLS 미사용)
  - [ ] GRANT 권한 확인 (anon, authenticated, service_role)
- [x] Clerk 연동 (회원가입/로그인)
  - [ ] Clerk Dashboard에서 Supabase 통합 활성화 (수동 확인 필요)
  - [ ] Supabase Dashboard → Authentication → Third-Party Auth에 Clerk Domain 등록 (수동 확인 필요)
  - [x] `ClerkProvider` 설정 확인 (`app/layout.tsx`)
  - [x] `SyncUserProvider` 동작 확인 (Clerk → Supabase 사용자 동기화)
  - [x] 미들웨어 인증 로직 확인 (`middleware.ts`, redirectToSignIn)
  - [x] Navbar 로그인/유저 버튼 동작 확인
- [ ] Storage 버킷 준비
  - [ ] `uploads` 버킷 생성 확인 (Supabase Dashboard, 수동 확인 필요)
  - [x] 서버 라우트 `/api/storage/check-bucket` 동작 확인
- [x] 기본 레이아웃 및 라우팅
  - [x] Root Layout 확인 (`app/layout.tsx`)
  - [x] Navbar 컴포넌트 확인
    - [x] 브랜드명 "OZ SHOP"으로 변경 (`components/Navbar.tsx`)
    - [x] 헤더에 장바구니 아이콘 추가 (어떤 페이지에서든 접근 가능)
    - [x] 인증 테스트 버튼 제거
  - [x] 기본 라우팅 구조 설계 (`app/page.tsx`, `app/auth-test`, `app/storage-test` 등)
- [ ] 설정 파일 정리
  - [ ] `next.config.ts` 경고 제거
    - [ ] `experimental.serverComponentsExternalPackages` → `serverExternalPackages`로 키명 변경

## Phase 2: 상품 기능 (1주)

- [x] 홈페이지 (`app/page.tsx`)
  - [x] 상품목록 표시
    - [x] Supabase `products` 테이블 조회
    - [x] `is_active = true` 필터링
    - [x] 상품 카드 컴포넌트 (이미지, 이름, 가격, 카테고리)
    - [x] 상품 상세 페이지로 이동 링크
    - [x] 반응형 그리드 레이아웃
    - [x] 상품 이미지 없을 때 placeholder 표시
  - [x] 카테고리 기능 (다중 선택 + SSR)
    - [x] 카테고리 버튼 UI (electronics, clothing, books, food, sports, beauty, home)
    - [x] URL 쿼리 기반 필터링 (`?categories=electronics,books`)
    - [x] 전체 상품 보기 옵션 (쿼리 제거)
    - [x] 선택된 카테고리 하이라이트 스타일
  - [x] 인기상품 기능
    - [x] 인기 상품 조회 로직 구현 (주문 수 또는 조회 수 기반, 또는 임시로 최신 상품)
    - [x] 인기 상품 카드 컴포넌트
    - [x] "인기 상품" 섹션 헤더 및 레이아웃
    - [x] 인기 상품 상세 페이지로 이동 링크
  - [x] 정렬 기능 (가격오름순/가격내림순/인기순/이름순)
  - [x] 페이지네이션 (12개씩, 번호 버튼)
  - [x] 로딩/에러/빈 상태 처리
- [x] 상품 목록 페이지 (`app/products/page.tsx`)
  - [x] Supabase `products` 테이블 조회
  - [x] `is_active = true` 필터링
  - [x] 카테고리 필터링 (다중 선택)
  - [x] 가격오름순/가격내림순/인기순/이름순 정렬 기능
  - [x] 페이지네이션 (12개씩, 번호 버튼)
  - [x] 로딩/에러/빈 상태 처리
- [x] 상품 상세 페이지 (`app/products/[id]/page.tsx`)
  - [x] 상품 정보 표시 (이름, 설명, 가격, 카테고리)
  - [x] 재고 수량 표시 (`stock_quantity`)
  - [x] 장바구니 담기 버튼 (UI만, Phase 3에서 기능 연결 예정)
  - [x] 상품 활성화 여부 확인 (`is_active`)
  - [x] 상품 이미지 없을 때 placeholder 표시
- [ ] 어드민 상품 등록 (MVP 제외)
  - [ ] PRD에 따라 어드민 기능은 MVP에서 제외
  - [ ] 상품 등록은 Supabase Dashboard에서 직접 수행

## Phase 3: 장바구니 & 주문 (1주)

- [x] 장바구니 기능
  - [x] 장바구니 페이지 (`app/cart/page.tsx`)
  - [x] 헤더에 장바구니 아이콘 추가 (Navbar 컴포넌트)
  - [x] 장바구니 아이콘에 품목 종류 수 배지 표시 (같은 품목은 1개로 카운팅)
  - [x] `cart_items` 테이블 연동
    - [x] `clerk_id` 기반 조회 (인증된 사용자만)
    - [x] `clerk_id + product_id` UNIQUE 제약 확인
  - [x] 장바구니 추가 기능
    - [x] 상품 상세 페이지에서 추가
    - [x] 중복 상품은 수량 증가
  - [x] 장바구니 삭제 기능
  - [x] 수량 변경 기능 (증가/감소)
  - [x] 금액 합계 계산 (price × quantity)
  - [x] 빈 장바구니 상태 처리
  - [x] 상품 이미지 없을 때 placeholder 표시
- [x] 주문 프로세스 구현
  - [x] 주문 페이지 (`app/checkout/page.tsx`)
  - [x] 배송지 정보 입력 (shipping_address JSONB)
  - [x] 주문 메모 입력 (order_note)
  - [x] 최종 금액 확인 (total_amount 계산)
- [x] 주문 테이블 연동
  - [x] `orders` 테이블에 주문 생성
    - [x] `clerk_id` 저장
    - [x] `status = 'pending'` 초기값
    - [x] `total_amount` 계산 후 저장
  - [x] `order_items` 테이블에 주문 상세 저장
    - [x] 주문 시점의 상품 정보 스냅샷 (product_name, price, quantity)
    - [x] `product_id` 참조 (나중에 참조용)

## Phase 4: 결제 통합 (1주) - Toss Payments MCP

- [ ] Toss Payments MCP 설정
  - [ ] Toss Payments MCP 서버 설정 확인 (`.cursor/mcp.json`)
  - [ ] 테스트 모드 API 키 설정
  - [ ] 환경 변수 설정
- [ ] 결제 위젯 연동
  - [ ] 결제 페이지에 Toss Payments 위젯 통합
  - [ ] 테스트 모드로 설정 확인
  - [ ] 결제 금액 전달 (orders.total_amount)
  - [ ] 주문 ID 전달
- [ ] 결제 성공 콜백 처리
  - [ ] 결제 성공 시 `orders.status` 업데이트 ('pending' → 'confirmed')
  - [ ] 결제 정보 저장 (선택적, payments 테이블이 있다면)
  - [ ] 성공 페이지 리다이렉트
- [ ] 결제 실패/취소 플로우 처리
  - [ ] 결제 실패 시 주문 상태 유지 ('pending')
  - [ ] 사용자에게 실패 메시지 표시
  - [ ] 재시도 또는 장바구니로 돌아가기 옵션
- [ ] 결제 완료 후 주문 저장
  - [ ] 최종 주문 정보 확인
  - [ ] 재고 차감 로직 (stock_quantity 감소, 선택적)

## Phase 5: 마이페이지 (0.5주)

- [ ] 마이페이지 기본 레이아웃 (`app/my/page.tsx`)
  - [ ] 사용자 정보 표시 (Clerk에서 가져오기)
  - [ ] 네비게이션 메뉴 (주문 내역 등)
- [ ] 주문 내역 조회 (`app/my/orders/page.tsx`)
  - [ ] `orders` 테이블 조회 (clerk_id 기반)
  - [ ] 최신순 정렬 (`created_at DESC`)
  - [ ] 주문 상태 표시 (pending, confirmed, shipped, delivered, cancelled)
  - [ ] 주문 총액 표시
  - [ ] 주문 날짜 표시
- [ ] 주문 상세 보기 (`app/my/orders/[id]/page.tsx`)
  - [ ] 주문 정보 표시 (주문 ID, 상태, 총액, 배송지, 주문 메모)
  - [ ] `order_items` 조회하여 주문 상세 아이템 목록 표시
  - [ ] 각 아이템 정보 (상품명, 수량, 단가, 소계)
  - [ ] 주문 취소 버튼 (status가 'pending'일 때만)

## Phase 6: 테스트 & 배포 (0.5주)

- [ ] 전체 플로우 E2E 테스트
  - [ ] 회원가입/로그인 플로우
  - [ ] 상품 목록 조회 → 상세 페이지
  - [ ] 장바구니 추가 → 수량 변경 → 삭제
  - [ ] 주문 생성 → 결제 진행 → 주문 저장
  - [ ] 마이페이지에서 주문 내역 확인
- [ ] 에러 핸들링 확인
  - [ ] 네트워크 에러 처리
  - [ ] 인증 에러 처리
  - [ ] 결제 에러 처리
  - [ ] 사용자 친화적 에러 메시지
- [ ] 코드 품질 검증
  - [ ] ESLint 오류 0건
  - [ ] TypeScript 타입 오류 0건
  - [ ] 빌드 성공 확인 (`pnpm build`)
- [ ] Vercel 배포
  - [ ] 환경 변수 최종 확인 (Vercel Project Settings)
  - [ ] 빌드 성공 확인
  - [ ] 프로덕션 배포
  - [ ] 배포 후 기능 동작 확인

---

## 문서/구조 보완 (선택사항)

- [ ] `.cursor/`
  - [ ] `rules/` 커서룰 정리 및 최신화
  - [ ] `mcp.json` MCP 서버 설정 점검 (Supabase, Toss Payments)
  - [ ] `DIR.md` 프로젝트 디렉토리 구조 문서화
- [ ] `.github/` 워크플로 (선택)
  - [ ] GitHub Actions CI/CD 설정
- [ ] `.husky/` 훅 (선택)
  - [ ] pre-commit, pre-push 훅 설정
- [ ] `app/` 보완 파일
  - [x] `error.tsx` 에러 페이지
  - [x] `loading.tsx` 로딩 페이지
  - [ ] `not-found.tsx` 404 페이지
  - [ ] `robots.ts` SEO 설정
  - [ ] `sitemap.ts` 사이트맵
  - [ ] `manifest.ts` PWA 매니페스트
- [ ] `public/` 자산 점검
  - [ ] `icons/` PWA 아이콘들
  - [ ] `logo.png` 로고 이미지
  - [ ] `og-image.png` OG 이미지
- [ ] 포맷/린트 설정
  - [ ] `.gitignore`, `.cursorignore` 최신화
  - [ ] `.prettierignore`, `.prettierrc` Prettier 설정
  - [ ] `eslint.config.mjs` ESLint 설정 확인
  - [ ] `tsconfig.json` TypeScript 설정 확인

---

## 📋 참고사항

### 데이터베이스 스키마 구조

- `products`: 상품 정보 (20개 샘플 데이터 포함)
- `cart_items`: 장바구니 (clerk_id 기반)
- `orders`: 주문 정보 (status 관리)
- `order_items`: 주문 상세 (스냅샷 방식)

### 제약사항 (PRD)

- RLS 비활성화 (애플리케이션 레벨에서 권한 체크)
- 어드민 기능 제외 (상품 등록은 Supabase Dashboard에서)
- 결제는 테스트 모드만 사용
- 배송 기능 없음 (주문 상태만 관리)

### 성공 지표

- 회원가입 수: 최소 50명
- 테스트 결제 시도: 최소 10건
- 결제 완료율: 50% 이상
- 장바구니 추가율: 방문자 대비 20%
