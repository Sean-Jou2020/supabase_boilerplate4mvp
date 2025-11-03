graph TD
Start([방문]) --> Home[홈페이지]

    Home --> Login{로그인?}
    Login -->|No| SignIn[Clerk 로그인]
    SignIn --> Home
    Login -->|Yes| Home

    Home --> HeroSection[랜딩 섹션 + CTA]
    Home --> PopularProducts[인기 상품 섹션]
    Home --> ProductList[상품 목록 섹션]
    Home --> CategoryFilter[카테고리 필터]

    PopularProducts --> Detail1[상품 상세]
    ProductList --> Detail1
    CategoryFilter -->|필터 적용| ProductList

    Detail1 --> AddCart[장바구니 추가]
    AddCart --> Cart{장바구니로 이동?}
    Cart -->|Yes| CartPage[장바구니 페이지]
    Cart -->|No| Detail1

    CartPage --> Edit{수정/삭제}
    Edit --> CartPage

    CartPage --> Order[주문/결제 페이지]

    Order --> Shipping[배송지 정보 입력]
    Shipping --> OrderConfirm[주문 확인]
    OrderConfirm --> Pay[Toss 테스트 결제]

    Pay --> Success{결제 성공?}
    Success -->|Yes| Complete[주문 완료]
    Success -->|No| Order

    Complete --> MyPage[마이페이지]
    Home --> MyPage
    MyPage --> OrderList[주문 내역]
    OrderList --> OrderDetail[주문 상세]
    OrderDetail --> MyPage

    Home --> ProductsPage[전체 상품 목록 페이지]
    ProductsPage --> CategoryFilter
    ProductsPage --> Detail2[상품 상세]
    Detail2 --> AddCart

    style Start fill:#e1f5e1
    style Complete fill:#f0e1ff
    style Pay fill:#e1f0ff
    style SignIn fill:#fff4e1
    style PopularProducts fill:#ffe1f0
    style CategoryFilter fill:#e1ffe1
