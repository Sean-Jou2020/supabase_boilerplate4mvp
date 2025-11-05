/**
 * @file page.tsx
 * @description 상품 목록 페이지
 *
 * 모든 활성 상품을 목록으로 표시하며, 카테고리 필터링과 정렬 기능을 제공합니다.
 */

import {
  getActiveProducts,
  getActiveProductsByCategories,
  getActiveProductsCount,
} from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";
import { ProductSort } from "@/components/product-sort";
import { Pagination } from "@/components/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { parseCategoriesParam } from "@/lib/categories";
import { parseSortParam } from "@/lib/sort";
import {
  parsePageParam,
  createPaginationMeta,
  PER_PAGE,
} from "@/lib/pagination";

/**
 * 상품 목록 페이지
 * 카테고리 필터링과 정렬 기능을 제공합니다.
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const selectedCategories = parseCategoriesParam(searchParams?.categories);
  const sort = parseSortParam(searchParams?.sort);
  const page = parsePageParam(searchParams?.page);

  let products = [] as any[];
  let totalCount = 0;
  let error = null;

  try {
    // 총 개수 조회
    totalCount = await getActiveProductsCount(
      selectedCategories.length > 0 ? selectedCategories : null,
    );

    // 상품 목록 조회 (페이지네이션 적용)
    if (selectedCategories.length > 0) {
      products = await getActiveProductsByCategories(
        selectedCategories,
        sort,
        page,
        PER_PAGE,
      );
    } else {
      products = await getActiveProducts(sort, page, PER_PAGE);
    }
  } catch (err) {
    console.error("상품 조회 실패:", err);
    error =
      err instanceof Error
        ? err.message
        : "상품을 불러오는 중 오류가 발생했습니다.";

    // 에러가 발생해도 totalCount가 0이면 페이지네이션을 표시하지 않음
    // 하지만 실제로는 상품이 있을 수 있으므로, 에러 상태를 표시
  }

  // 페이지네이션 메타데이터 생성
  const paginationMeta = createPaginationMeta(page, totalCount, PER_PAGE);

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl">
        {/* 헤더 섹션 */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            상품 목록
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            다양한 상품을 확인하고 구매해보세요
          </p>
        </section>

        {/* 필터 및 정렬 섹션 */}
        <section className="mb-8">
          <CategoryFilter selected={selectedCategories} />
          <ProductSort selected={sort} />
        </section>

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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
