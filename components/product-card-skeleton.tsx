/**
 * @file product-card-skeleton.tsx
 * @description 상품 카드 스켈레톤 컴포넌트
 *
 * 로딩 중 상품 카드의 스켈레톤 UI를 제공합니다.
 * 실제 상품 카드와 동일한 레이아웃을 유지합니다.
 */

import { cn } from "@/lib/utils";

/**
 * 상품 카드 스켈레톤 컴포넌트
 * 로딩 중 상품 카드의 플레이스홀더 역할
 */
export function ProductCardSkeleton() {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm"
      )}
    >
      {/* 이미지 스켈레톤 */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <div className="h-full w-full animate-pulse bg-muted-foreground/20" />
      </div>

      {/* 정보 스켈레톤 */}
      <div className="flex flex-col gap-2 p-4">
        {/* 카테고리 스켈레톤 */}
        <div className="h-3 w-16 animate-pulse rounded bg-muted-foreground/20" />

        {/* 상품명 스켈레톤 */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/20" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted-foreground/20" />
        </div>

        {/* 가격 스켈레톤 */}
        <div className="h-6 w-24 animate-pulse rounded bg-muted-foreground/20" />
      </div>
    </div>
  );
}

