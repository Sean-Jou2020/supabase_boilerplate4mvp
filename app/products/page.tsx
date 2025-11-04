/**
 * @file page.tsx
 * @description 상품 목록 페이지
 *
 * 모든 활성 상품을 목록으로 표시하며, 카테고리 필터링과 정렬 기능을 제공합니다.
 */

import {
  getActiveProducts,
  getActiveProductsByCategories,
} from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";
import { ProductSort } from "@/components/product-sort";
import { parseCategoriesParam } from "@/lib/categories";
import { parseSortParam } from "@/lib/sort";

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
  let products = [] as any[];
  let error = null;

  try {
    if (selectedCategories.length > 0) {
      products = await getActiveProductsByCategories(selectedCategories, sort);
    } else {
      products = await getActiveProducts(sort);
    }
  } catch (err) {
    console.error("상품 조회 실패:", err);
    error = err instanceof Error
      ? err.message
      : "상품을 불러오는 중 오류가 발생했습니다.";
  }

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
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border p-6 text-center">
              <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

