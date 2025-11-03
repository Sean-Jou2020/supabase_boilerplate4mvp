# 쇼핑몰 MVP 유저 플로우

쇼핑몰의 주요 사용자 시나리오를 Mermaid 플로우차트로 시각화합니다.

## 전체 유저 플로우 (메인 플로우)

```mermaid
graph TD
    Start([사용자 방문]) --> CheckAuth{인증 상태 확인}
    
    CheckAuth -->|미인증| AuthFlow[인증 플로우]
    CheckAuth -->|인증됨| HomePage[홈페이지]
    
    AuthFlow --> ClerkSignIn[Clerk 로그인/회원가입]
    ClerkSignIn --> SyncUser[Supabase 사용자 동기화]
    SyncUser --> HomePage
    
    HomePage --> BrowseProducts[상품 둘러보기]
    HomePage --> ViewCart[장바구니 보기]
    HomePage --> ViewMyPage[마이페이지]
    
    BrowseProducts --> ProductList[상품 목록 페이지]
    BrowseProducts --> CategoryFilter[카테고리 필터]
    
    ProductList --> ProductDetail[상품 상세 페이지]
    CategoryFilter -->|필터 적용| ProductList
    
    ProductDetail --> CheckStock{재고 확인}
    CheckStock -->|재고 있음| AddToCart[장바구니 추가]
    CheckStock -->|재고 없음| OutOfStock[품절 안내]
    
    AddToCart --> CartDecision{장바구니로 이동?}
    CartDecision -->|예| ViewCart
    CartDecision -->|아니오| ProductDetail
    CartDecision -->|계속 쇼핑| ProductList
    
    ViewCart --> CartManagement[장바구니 관리]
    CartManagement --> UpdateQuantity[수량 변경]
    CartManagement --> RemoveItem[상품 삭제]
    UpdateQuantity --> ViewCart
    RemoveItem --> ViewCart
    
    ViewCart --> Checkout{주문하기?}
    Checkout -->|예| AuthCheck{인증 확인}
    Checkout -->|아니오| HomePage
    
    AuthCheck -->|미인증| AuthFlow
    AuthCheck -->|인증됨| OrderPage[주문 페이지]
    
    OrderPage --> EnterShipping[배송지 정보 입력]
    EnterShipping --> EnterNote[주문 메모 입력]
    EnterNote --> ConfirmOrder[주문 금액 확인]
    
    ConfirmOrder --> PaymentProcess[Toss Payments 결제]
    PaymentProcess --> PaymentResult{결제 결과}
    
    PaymentResult -->|성공| CreateOrder[주문 생성]
    PaymentResult -->|실패| PaymentError[결제 오류]
    PaymentError --> OrderPage
    
    CreateOrder --> SaveOrderItems[주문 상세 저장]
    SaveOrderItems --> ClearCart[장바구니 비우기]
    ClearCart --> OrderComplete[주문 완료 페이지]
    
    OrderComplete --> ViewMyPage
    
    ViewMyPage --> OrderHistory[주문 내역 조회]
    OrderHistory --> OrderDetail[주문 상세 보기]
    OrderDetail --> ViewMyPage
    
    style Start fill:#e1f5e1
    style OrderComplete fill:#f0e1ff
    style PaymentProcess fill:#e1f0ff
    style AuthFlow fill:#fff4e1
    style PaymentError fill:#ffe1e1
    style OutOfStock fill:#ffe1e1
```

## 인증 플로우 상세

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Frontend as Next.js Frontend
    participant Clerk as Clerk Auth
    participant SyncAPI as Sync User API
    participant Supabase as Supabase DB
    
    User->>Frontend: 로그인/회원가입 클릭
    Frontend->>Clerk: Clerk 인증 페이지로 리다이렉트
    Clerk->>User: 로그인/회원가입 폼 표시
    User->>Clerk: 인증 정보 입력
    Clerk->>Clerk: 인증 처리
    Clerk->>Frontend: 인증 토큰 반환
    Frontend->>SyncAPI: POST /api/sync-user
    SyncAPI->>Supabase: users 테이블에 clerk_id로 사용자 동기화
    Supabase->>SyncAPI: 동기화 완료
    SyncAPI->>Frontend: 동기화 완료 응답
    Frontend->>User: 홈페이지로 리다이렉트
```

## 상품 조회 플로우

```mermaid
graph LR
    HomePage[홈페이지] --> ListPage[상품 목록]
    
    ListPage --> Filter[카테고리 필터]
    Filter -->|electronics| Electronics[전자제품 목록]
    Filter -->|clothing| Clothing[의류 목록]
    Filter -->|books| Books[도서 목록]
    Filter -->|food| Food[식품 목록]
    Filter -->|sports| Sports[스포츠 목록]
    Filter -->|beauty| Beauty[뷰티 목록]
    Filter -->|home| Home[홈/리빙 목록]
    
    Electronics --> Detail[상품 상세]
    Clothing --> Detail
    Books --> Detail
    Food --> Detail
    Sports --> Detail
    Beauty --> Detail
    Home --> Detail
    
    Detail --> AddCart[장바구니 추가]
    
    style HomePage fill:#e1f5e1
    style Detail fill:#e1f0ff
    style AddCart fill:#fff4e1
```

## 장바구니 플로우

```mermaid
stateDiagram-v2
    [*] --> EmptyCart: 장바구니 비어있음
    EmptyCart --> HasItems: 상품 추가
    
    HasItems --> ViewCart: 장바구니 페이지 접속
    ViewCart --> UpdateItem: 수량 변경
    ViewCart --> DeleteItem: 상품 삭제
    ViewCart --> Checkout: 주문하기
    
    UpdateItem --> ViewCart
    DeleteItem --> ViewCart
    DeleteItem --> EmptyCart: 모든 상품 삭제 시
    
    Checkout --> OrderProcess: 주문 프로세스 시작
    
    note right of EmptyCart
        cart_items 테이블에서
        clerk_id로 조회 시
        결과 없음
    end note
    
    note right of HasItems
        cart_items 테이블에
        clerk_id + product_id로
        저장됨
    end note
```

## 주문 및 결제 플로우

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Frontend as Next.js
    participant Supabase as Supabase
    participant TossPay as Toss Payments
    
    User->>Frontend: 주문하기 클릭
    Frontend->>Supabase: cart_items 조회 (clerk_id)
    Supabase->>Frontend: 장바구니 아이템 반환
    
    User->>Frontend: 배송지 정보 입력
    User->>Frontend: 주문 메모 입력
    Frontend->>Frontend: 총 주문 금액 계산
    
    User->>Frontend: 결제하기 클릭
    Frontend->>TossPay: 결제 요청 (테스트 모드)
    TossPay->>User: 결제 페이지 표시
    User->>TossPay: 결제 정보 입력
    TossPay->>TossPay: 결제 처리
    
    alt 결제 성공
        TossPay->>Frontend: 결제 성공 콜백
        Frontend->>Supabase: orders 테이블에 주문 생성
        Supabase->>Supabase: order_items 테이블에 주문 상세 저장
        Supabase->>Supabase: cart_items 테이블에서 해당 아이템 삭제
        Frontend->>User: 주문 완료 페이지 표시
    else 결제 실패
        TossPay->>Frontend: 결제 실패 콜백
        Frontend->>User: 결제 오류 메시지 표시
        Frontend->>User: 주문 페이지로 복귀
    end
```

## 데이터베이스 연동 플로우

```mermaid
graph TD
    Client[클라이언트 요청] --> AuthCheck{인증 확인}
    
    AuthCheck -->|인증됨| GetClerkId[Clerk에서 clerk_id 조회]
    AuthCheck -->|미인증| Error[인증 오류]
    
    GetClerkId --> QueryDB[Supabase 쿼리]
    
    QueryDB --> Products[products 테이블 조회]
    QueryDB --> CartItems[cart_items 테이블 조회<br/>WHERE clerk_id = ?]
    QueryDB --> Orders[orders 테이블 조회<br/>WHERE clerk_id = ?]
    QueryDB --> OrderItems[order_items 테이블 조회<br/>JOIN orders]
    
    Products --> Response[응답 반환]
    CartItems --> Response
    Orders --> Response
    OrderItems --> Response
    
    Response --> Client
    
    style AuthCheck fill:#fff4e1
    style QueryDB fill:#e1f0ff
    style Error fill:#ffe1e1
```

## 주문 상태 플로우

```mermaid
stateDiagram-v2
    [*] --> Pending: 주문 생성
    
    Pending --> Confirmed: 결제 완료
    Pending --> Cancelled: 주문 취소
    
    Confirmed --> Processing: 주문 처리 시작
    Confirmed --> Cancelled: 취소 요청
    
    Processing --> Shipped: 배송 시작
    Processing --> Cancelled: 취소 요청
    
    Shipped --> Delivered: 배송 완료
    Shipped --> Cancelled: 취소 요청 (배송 전)
    
    Delivered --> Refunded: 환불 처리 (선택)
    
    Cancelled --> [*]
    Refunded --> [*]
    
    note right of Pending
        orders.status = 'pending'
        초기 상태
    end note
    
    note right of Confirmed
        orders.status = 'confirmed'
        결제 완료 후
    end note
    
    note right of Delivered
        orders.status = 'delivered'
        최종 완료 상태
    end note
```

## 에러 처리 플로우

```mermaid
graph TD
    Action[사용자 액션] --> TryAction{액션 시도}
    
    TryAction --> Success{성공?}
    
    Success -->|예| SuccessPage[성공 페이지/메시지]
    Success -->|아니오| ErrorType{에러 타입}
    
    ErrorType -->|인증 오류| AuthError[로그인 필요 안내]
    ErrorType -->|재고 부족| StockError[재고 부족 안내]
    ErrorType -->|결제 오류| PaymentError[결제 오류 안내]
    ErrorType -->|네트워크 오류| NetworkError[네트워크 오류 안내]
    ErrorType -->|서버 오류| ServerError[서버 오류 안내]
    
    AuthError --> RedirectLogin[로그인 페이지로 이동]
    StockError --> ProductDetail[상품 상세로 복귀]
    PaymentError --> OrderPage[주문 페이지로 복귀]
    NetworkError --> Retry[재시도 안내]
    ServerError --> Contact[고객센터 안내]
    
    RedirectLogin --> TryAction
    ProductDetail --> TryAction
    OrderPage --> TryAction
    Retry --> TryAction
    
    style ErrorType fill:#ffe1e1
    style AuthError fill:#fff4e1
    style PaymentError fill:#ffe1e1
    style SuccessPage fill:#e1f5e1
```

## 주요 페이지 네비게이션

```mermaid
graph LR
    Home[/ 홈페이지<br/>/] --> Products[/ 상품 목록<br/>/products]
    Home --> Cart[/ 장바구니<br/>/cart]
    Home --> MyPage[/ 마이페이지<br/>/my-page]
    
    Products --> Detail[/ 상품 상세<br/>/products/[id]]
    Products --> Category[/ 상품 목록<br/>카테고리 필터<br/>/products?category=electronics]
    
    Detail --> Cart
    Detail --> Products
    
    Cart --> Checkout[/ 주문하기<br/>/checkout]
    Cart --> Products
    
    Checkout --> Complete[/ 주문 완료<br/>/order/complete]
    
    MyPage --> OrderHistory[/ 주문 내역<br/>/my-page/orders]
    MyPage --> OrderDetail[/ 주문 상세<br/>/my-page/orders/[id]]
    
    OrderDetail --> OrderHistory
    OrderHistory --> MyPage
    
    Complete --> MyPage
    Complete --> Products
    
    style Home fill:#e1f5e1
    style Complete fill:#f0e1ff
    style Checkout fill:#e1f0ff
```

