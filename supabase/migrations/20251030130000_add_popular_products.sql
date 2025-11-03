-- ==========================================
-- 주문 수 기반 인기 상품 기능 추가
-- 파일명: 20251030130000_add_popular_products.sql
-- ==========================================

-- 1. 상품별 주문 수 집계 뷰 생성 (인기 상품 조회용)
CREATE OR REPLACE VIEW public.product_order_stats AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.category,
    p.stock_quantity,
    p.is_active,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT oi.order_id) AS order_count,  -- 주문 건수
    SUM(oi.quantity) AS total_quantity_ordered,   -- 총 주문 수량
    SUM(oi.quantity * oi.price) AS total_revenue  -- 총 매출액
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
LEFT JOIN public.orders o ON oi.order_id = o.id
WHERE p.is_active = true
    AND (o.status IS NULL OR o.status IN ('confirmed', 'shipped', 'delivered'))  -- 취소되지 않은 주문만 집계
GROUP BY p.id, p.name, p.description, p.price, p.category, p.stock_quantity, p.is_active, p.created_at, p.updated_at;

-- 2. 인기 상품 조회용 뷰 생성 (주문 수 기준 정렬)
CREATE OR REPLACE VIEW public.popular_products AS
SELECT *
FROM public.product_order_stats
ORDER BY order_count DESC, total_quantity_ordered DESC, created_at DESC;

-- 3. 성능 최적화를 위한 인덱스 추가
-- order_items 테이블의 product_id와 order_id 조합 인덱스 (이미 order_id 인덱스가 있지만, product_id 기반 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_order_items_product_id_order_id 
ON public.order_items(product_id, order_id);

-- orders 테이블의 status 인덱스 (이미 있지만 명시적으로 확인)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
ON public.orders(status, created_at DESC);

-- 4. 뷰 권한 부여
GRANT SELECT ON public.product_order_stats TO anon, authenticated, service_role;
GRANT SELECT ON public.popular_products TO anon, authenticated, service_role;

-- 5. 뷰 소유자 설정
ALTER VIEW public.product_order_stats OWNER TO postgres;
ALTER VIEW public.popular_products OWNER TO postgres;

-- ==========================================
-- 사용 예시:
-- 
-- -- 인기 상품 TOP 10 조회 (주문 수 기준)
-- SELECT * FROM popular_products LIMIT 10;
-- 
-- -- 특정 카테고리의 인기 상품 조회
-- SELECT * FROM popular_products WHERE category = 'electronics' LIMIT 5;
-- 
-- -- 주문 수가 0인 상품도 포함하여 전체 상품 통계 조회
-- SELECT * FROM product_order_stats ORDER BY order_count DESC;
-- ==========================================

