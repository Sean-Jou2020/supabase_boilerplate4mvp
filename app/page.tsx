import {
  getActiveProducts,
  getActiveProductsByCategories,
  getPopularProducts,
  getActiveProductsCount,
} from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";
import { ProductSort } from "@/components/product-sort";
import { ProductSearch } from "@/components/product-search";
import { Pagination } from "@/components/pagination";
import { PopularProductsCarousel } from "@/components/popular-products-carousel";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { parseCategoriesParam } from "@/lib/categories";
import { parseSortParam } from "@/lib/sort";
import { parseSearchParam } from "@/lib/search";
import {
  parsePageParam,
  createPaginationMeta,
  PER_PAGE,
} from "@/lib/pagination";

/**
 * 홈페이지
 * 활성화된 상품 목록을 반응형 그리드 레이아웃으로 표시합니다.
 * 인기상품 섹션과 전체 상품 목록을 포함합니다.
 */
export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const selectedCategories = parseCategoriesParam(searchParams?.categories);
  const sort = parseSortParam(searchParams?.sort);
  const page = parsePageParam(searchParams?.page);
  const search = parseSearchParam(searchParams?.search);

  let products = [] as any[];
  let popularProducts = [] as any[];
  let totalCount = 0;
  let error = null;
  let popularError = null;

  try {
    // 총 개수 조회
    totalCount = await getActiveProductsCount(
      selectedCategories.length > 0 ? selectedCategories : null,
      search || undefined,
    );

    // 상품 목록 조회 (페이지네이션 적용)
    if (selectedCategories.length > 0) {
      products = await getActiveProductsByCategories(
        selectedCategories,
        sort,
        page,
        PER_PAGE,
        search || undefined,
      );
    } else {
      products = await getActiveProducts(sort, page, PER_PAGE, search || undefined);
    }
  } catch (err) {
    console.error("상품 조회 실패:", err);
    error =
      err instanceof Error
        ? err.message
        : "상품을 불러오는 중 오류가 발생했습니다.";
  }

  // 페이지네이션 메타데이터 생성
  const paginationMeta = createPaginationMeta(page, totalCount, PER_PAGE);

  // 인기상품 조회 (항상 표시)
  try {
    popularProducts = await getPopularProducts(8);
  } catch (err) {
    console.error("인기상품 조회 실패:", err);
    popularError = err instanceof Error ? err.message : null;
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-3 py-4 md:px-4 md:py-6 lg:px-6 lg:py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* 헤더 섹션 */}
        <section className="mb-8">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl lg:text-6xl">
            쇼핑몰에 오신 것을 환영합니다
          </h1>
          <ProductSearch initialValue={search} />
        </section>

        {/* 인기상품 섹션 (항상 표시) */}
        {popularProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-semibold md:text-3xl">
              인기 상품
            </h2>
            {popularError ? (
              <ErrorState message={popularError} />
            ) : (
              <PopularProductsCarousel products={popularProducts} />
            )}
          </section>
        )}

        {/* 상품 목록 섹션 */}
        <section>
          {error ? (
            <ErrorState message={error} />
          ) : products.length === 0 ? (
            <EmptyState
              message="등록된 상품이 없습니다."
              description="다른 카테고리를 선택하거나 나중에 다시 확인해주세요."
              actionType="products"
            />
          ) : (
            <>
              <h2 className="mb-2 text-2xl font-semibold md:text-3xl">
                상품 목록
              </h2>
              <CategoryFilter selected={selectedCategories} />
              <ProductSort selected={sort} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {/* 페이지네이션 */}
              {paginationMeta.totalPages > 1 && (
                <div className="mt-12">
                  <Pagination meta={paginationMeta} />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
