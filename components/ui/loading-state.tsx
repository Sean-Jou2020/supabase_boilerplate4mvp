/**
 * @file loading-state.tsx
 * @description 로딩 상태 컴포넌트
 *
 * 데이터 로딩 중 스켈레톤 UI를 표시합니다.
 * 상품 카드 스켈레톤을 활용합니다.
 */

import { ProductCardSkeleton } from "@/components/product-card-skeleton";

type Props = {
  /**
   * 표시할 스켈레톤 카드 개수 (기본값: 8)
   */
  count?: number;
  /**
   * 그리드 컬럼 수 클래스 (기본값: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4")
   */
  gridClassName?: string;
};

/**
 * 로딩 상태 컴포넌트
 */
export function LoadingState({
  count = 8,
  gridClassName = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
}: Props) {
  return (
    <div className={`grid gap-6 ${gridClassName}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

