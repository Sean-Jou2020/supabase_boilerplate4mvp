-- ==========================================
-- Clerk + Supabase 쇼핑몰 스키마 마이그레이션
-- RLS 없이 애플리케이션 레벨에서 clerk_id로 필터링
-- 파일명: 20251103124856_create_shopping_mall_schema.sql
-- ==========================================

-- ==========================================
-- 1. 상품 테이블 (products)
-- ==========================================
-- 상품 정보를 저장하는 메인 테이블
-- 카테고리별 상품 관리를 위한 기본 구조

create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    price decimal(10, 2) not null check (price >= 0),
    category text not null check (category in (
        'electronics',
        'clothing',
        'books',
        'food',
        'sports',
        'beauty',
        'home',
        'accessories',
        'toys',
        'automotive'
    )),
    stock_quantity integer default 0 not null check (stock_quantity >= 0),
    is_active boolean default true not null,
    image_url text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

comment on table public.products is '쇼핑몰 상품 정보 테이블. Clerk 인증 사용자를 위한 상품 목록 관리.';
comment on column public.products.id is '상품 고유 식별자 (UUID)';
comment on column public.products.name is '상품명';
comment on column public.products.description is '상품 상세 설명';
comment on column public.products.price is '상품 가격 (0 이상)';
comment on column public.products.category is '상품 카테고리 (electronics, clothing, books 등)';
comment on column public.products.stock_quantity is '재고 수량 (0 이상)';
comment on column public.products.is_active is '상품 활성화 여부 (true: 판매중, false: 판매중지)';
comment on column public.products.image_url is '상품 이미지 URL';

-- ==========================================
-- 2. 장바구니 테이블 (cart_items)
-- ==========================================
-- 사용자별 장바구니 상품 관리
-- clerk_id 기반으로 사용자 식별

create table if not exists public.cart_items (
    id uuid default gen_random_uuid() primary key,
    clerk_id text not null,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity integer not null default 1 check (quantity > 0),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(clerk_id, product_id)
);

comment on table public.cart_items is '사용자 장바구니 아이템 테이블. clerk_id로 사용자 식별.';
comment on column public.cart_items.id is '장바구니 아이템 고유 식별자 (UUID)';
comment on column public.cart_items.clerk_id is 'Clerk 사용자 ID (TEXT 타입)';
comment on column public.cart_items.product_id is '상품 참조 (상품 삭제 시 CASCADE)';
comment on column public.cart_items.quantity is '장바구니 상품 수량 (1 이상)';
comment on constraint cart_items_clerk_id_product_id_key on public.cart_items is '동일 사용자가 같은 상품을 중복으로 담을 수 없도록 제한';

-- ==========================================
-- 3. 주문 테이블 (orders)
-- ==========================================
-- 사용자별 주문 정보 관리
-- 주문 상태와 배송 정보 포함

create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    clerk_id text not null,
    total_amount decimal(10, 2) not null check (total_amount >= 0),
    status text not null default 'pending' check (status in (
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    )),
    shipping_address jsonb,
    order_note text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

comment on table public.orders is '주문 정보 테이블. clerk_id로 주문자 식별.';
comment on column public.orders.id is '주문 고유 식별자 (UUID)';
comment on column public.orders.clerk_id is '주문자 Clerk 사용자 ID';
comment on column public.orders.total_amount is '주문 총 금액 (0 이상)';
comment on column public.orders.status is '주문 상태 (pending, confirmed, shipped, delivered, cancelled, refunded)';
comment on column public.orders.shipping_address is '배송지 정보 (JSON 형식)';
comment on column public.orders.order_note is '주문 메모/요청사항';

-- ==========================================
-- 4. 주문 상세 테이블 (order_items)
-- ==========================================
-- 주문별 상품 상세 정보
-- 주문 시점의 상품 정보 스냅샷 저장 (가격 변경 대비)

create table if not exists public.order_items (
    id uuid default gen_random_uuid() primary key,
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete restrict,
    product_name text not null,
    quantity integer not null check (quantity > 0),
    price decimal(10, 2) not null check (price >= 0),
    created_at timestamp with time zone default now() not null
);

comment on table public.order_items is '주문 상세 아이템 테이블. 주문 시점의 상품 정보 스냅샷 저장.';
comment on column public.order_items.id is '주문 상세 아이템 고유 식별자 (UUID)';
comment on column public.order_items.order_id is '주문 참조 (주문 삭제 시 CASCADE)';
comment on column public.order_items.product_id is '상품 참조 (상품 삭제 시 RESTRICT - 주문이 있으면 삭제 불가)';
comment on column public.order_items.product_name is '주문 시점의 상품명 (스냅샷)';
comment on column public.order_items.quantity is '주문 수량 (1 이상)';
comment on column public.order_items.price is '주문 시점의 상품 가격 (스냅샷, 0 이상)';

-- ==========================================
-- 5. updated_at 자동 갱신 함수
-- ==========================================
-- 모든 테이블의 updated_at 컬럼을 자동으로 갱신하는 트리거 함수

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

comment on function public.update_updated_at_column() is '테이블 업데이트 시 updated_at 컬럼을 자동으로 현재 시간으로 갱신하는 트리거 함수';

-- ==========================================
-- 6. updated_at 트리거 등록
-- ==========================================
-- products, cart_items, orders 테이블에 updated_at 자동 갱신 트리거 적용

create trigger set_updated_at_products
    before update on public.products
    for each row
    execute function public.update_updated_at_column();

create trigger set_updated_at_cart_items
    before update on public.cart_items
    for each row
    execute function public.update_updated_at_column();

create trigger set_updated_at_orders
    before update on public.orders
    for each row
    execute function public.update_updated_at_column();

-- ==========================================
-- 7. 인덱스 생성 (성능 최적화)
-- ==========================================
-- 자주 조회되는 컬럼에 인덱스 생성하여 쿼리 성능 향상

-- cart_items 테이블 인덱스
create index if not exists idx_cart_items_clerk_id on public.cart_items(clerk_id);
create index if not exists idx_cart_items_product_id on public.cart_items(product_id);

-- orders 테이블 인덱스
create index if not exists idx_orders_clerk_id on public.orders(clerk_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- order_items 테이블 인덱스
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- products 테이블 인덱스
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_products_created_at on public.products(created_at desc);

-- ==========================================
-- 8. RLS 명시적 비활성화
-- ==========================================
-- PRD 요구사항: RLS 사용하지 않음
-- 애플리케이션 레벨에서 clerk_id 기반 권한 관리

alter table public.products disable row level security;
alter table public.cart_items disable row level security;
alter table public.orders disable row level security;
alter table public.order_items disable row level security;

-- ==========================================
-- 9. 권한 부여
-- ==========================================
-- Supabase 역할별 테이블 접근 권한 부여

grant all on table public.products to anon, authenticated, service_role;
grant all on table public.cart_items to anon, authenticated, service_role;
grant all on table public.orders to anon, authenticated, service_role;
grant all on table public.order_items to anon, authenticated, service_role;

-- ==========================================
-- 10. 개발용 샘플 데이터 (20개 상품)
-- ==========================================
-- 현실적인 쇼핑몰 상품 데이터
-- 다양한 카테고리와 가격대 포함

insert into public.products (
    name,
    description,
    price,
    category,
    stock_quantity,
    is_active,
    image_url
) values
    -- Electronics (4개)
    (
        'AirPods Pro 3세대',
        '액티브 노이즈 캔슬링, 공간 음향, 최대 30시간 재생시간',
        329000,
        'electronics',
        150,
        true,
        'https://example.com/images/airpods-pro.jpg'
    ),
    (
        'iPad Air 11인치',
        'M2 칩, Liquid Retina 디스플레이, 256GB 저장공간',
        1199000,
        'electronics',
        80,
        true,
        'https://example.com/images/ipad-air.jpg'
    ),
    (
        '갤럭시 워치 7',
        '건강 모니터링, GPS, 방수, 40mm 골드',
        359000,
        'electronics',
        120,
        true,
        'https://example.com/images/galaxy-watch.jpg'
    ),
    (
        '무선 충전기 3in1',
        '스마트폰, 무선이어폰, 스마트워치 동시 충전',
        89000,
        'electronics',
        200,
        true,
        'https://example.com/images/wireless-charger.jpg'
    ),

    -- Clothing (4개)
    (
        '오버핏 후드티 3컬러',
        '면 100%, 부드러운 안감, 넉넉한 핏',
        59000,
        'clothing',
        250,
        true,
        'https://example.com/images/hoodie.jpg'
    ),
    (
        '슬림핏 데님 팬츠',
        '신축성 데님 원단, 5가지 사이즈, 무릎 올 여유',
        79000,
        'clothing',
        180,
        true,
        'https://example.com/images/jeans.jpg'
    ),
    (
        '골지 니트 카디건',
        '모직 혼방, 오픈 카라, 라운드넥 베이직 스타일',
        129000,
        'clothing',
        90,
        true,
        'https://example.com/images/cardigan.jpg'
    ),
    (
        '기본 코튼 반팔티',
        '면 100%, 심플한 디자인, 다양한 컬러 (흰/검/베이지/네이비)',
        29000,
        'clothing',
        400,
        true,
        'https://example.com/images/tshirt.jpg'
    ),

    -- Books (3개)
    (
        '클린 코드 (Clean Code)',
        '로버트 C. 마틴 저, 소프트웨어 장인 정신의 바이블',
        33000,
        'books',
        55,
        true,
        'https://example.com/images/clean-code.jpg'
    ),
    (
        '이펙티브 TypeScript',
        '댄 밴더캄 저, TypeScript 활용법 62가지',
        28000,
        'books',
        70,
        true,
        'https://example.com/images/effective-typescript.jpg'
    ),
    (
        'HTTP 완벽 가이드',
        '데이빗 고울리 저, 웹 개발자를 위한 필수 서적',
        45000,
        'books',
        40,
        true,
        'https://example.com/images/http-guide.jpg'
    ),

    -- Food (3개)
    (
        '프리미엄 원두 커피 1kg',
        '에티오피아 예가체프, 산미와 바디감의 완벽한 균형',
        32000,
        'food',
        100,
        true,
        'https://example.com/images/coffee-beans.jpg'
    ),
    (
        '유기농 아몬드 500g',
        '무염 로스팅, 비타민 E 풍부, 신선한 견과류',
        18000,
        'food',
        150,
        true,
        'https://example.com/images/almonds.jpg'
    ),
    (
        '올리브 오일 엑스트라 버진',
        '스페인 직수입, 냉압착 방식, 요리/샐러드용',
        35000,
        'food',
        80,
        true,
        'https://example.com/images/olive-oil.jpg'
    ),

    -- Sports (2개)
    (
        '프리미엄 요가 매트 10mm',
        '두꺼운 쿠션감, 미끄럼 방지 표면, 휴대용 스트랩 포함',
        45000,
        'sports',
        90,
        true,
        'https://example.com/images/yoga-mat.jpg'
    ),
    (
        '조절식 덤벨 세트 10kg',
        '각 덤벨당 5kg, 5단계 조절 가능, 홈트레이닝용',
        89000,
        'sports',
        65,
        true,
        'https://example.com/images/dumbbells.jpg'
    ),

    -- Beauty (2개)
    (
        '비타민C 세럼 30ml',
        '피부 톤 개선, 저자극 포뮬러, 멜라닌 생성 억제',
        42000,
        'beauty',
        120,
        true,
        'https://example.com/images/vitamin-c-serum.jpg'
    ),
    (
        '선크림 SPF50+ PA++++',
        '끈적임 없는 텍스처, 자외선 차단, 50ml',
        25000,
        'beauty',
        200,
        true,
        'https://example.com/images/sunscreen.jpg'
    ),

    -- Home (2개)
    (
        '디퓨저 세트 200ml',
        '천연 에센셜 오일 3종 포함, LED 조명 기능',
        38000,
        'home',
        110,
        true,
        'https://example.com/images/diffuser.jpg'
    ),
    (
        '스마트 LED 전구 세트',
        '앱 연동, 1600만 색상, 조명 밝기 조절 가능, 2개 세트',
        69000,
        'home',
        75,
        true,
        'https://example.com/images/smart-bulb.jpg'
    )
on conflict do nothing;

-- ==========================================
-- 마이그레이션 완료
-- ==========================================
-- 총 4개 테이블 생성 (products, cart_items, orders, order_items)
-- 인덱스 11개 생성
-- 트리거 3개 등록
-- 샘플 데이터 20개 삽입
-- RLS 명시적 비활성화 완료

