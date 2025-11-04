/**
 * @file loading.tsx
 * @description 로딩 상태 페이지
 *
 * Next.js App Router의 Suspense boundary가 트리거될 때
 * 자동으로 표시되는 로딩 페이지입니다.
 * 홈페이지 레이아웃과 일치하는 스켈레톤 UI를 제공합니다.
 */

import { ProductCardSkeleton } from "@/components/product-card-skeleton";

export default function Loading() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl">
        {/* 헤더 섹션 스켈레톤 */}
        <section className="mb-12 text-center">
          <div className="mb-4 h-12 w-3/4 animate-pulse rounded bg-muted-foreground/20 mx-auto md:h-16 lg:h-20" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted-foreground/20 mx-auto md:h-7" />
        </section>

        {/* 상품 목록 스켈레톤 */}
        <section>
          <div className="mb-6 h-8 w-32 animate-pulse rounded bg-muted-foreground/20 md:h-9" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

