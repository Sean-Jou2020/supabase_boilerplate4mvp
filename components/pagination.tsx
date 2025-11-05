/**
 * @file pagination.tsx
 * @description 페이지네이션 컴포넌트
 *
 * URL 쿼리 파라미터 기반으로 페이지네이션을 제공합니다.
 * 이전/다음 버튼과 페이지 번호 버튼을 포함합니다.
 */

"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/pagination";

type Props = {
  meta: PaginationMeta;
};

/**
 * 페이지네이션 컴포넌트
 * @param meta - 페이지네이션 메타데이터
 */
export function Pagination({ meta }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { currentPage, totalPages, hasNextPage, hasPrevPage } = meta;

  // 페이지 번호 버튼을 생성하는 함수
  const getPageNumbers = () => {
    const maxVisible = 5; // 최대 표시할 페이지 번호 수
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      // 전체 페이지가 maxVisible 이하인 경우 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지를 중심으로 표시
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      // 끝에서 오버플로우 발생 시 시작점 조정
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      // 첫 페이지 추가
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push("...");
        }
      }

      // 중간 페이지들
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 마지막 페이지 추가
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const updatePage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    const params = new URLSearchParams(searchParams?.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const url = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    startTransition(() => router.push(url, { scroll: false }));
  };

  const pageNumbers = getPageNumbers();

  // 페이지가 1개 이하인 경우 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="페이지네이션"
    >
      {/* 이전 페이지 버튼 */}
      <button
        type="button"
        onClick={() => updatePage(currentPage - 1)}
        disabled={!hasPrevPage || isPending}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md border transition-colors",
          hasPrevPage && !isPending
            ? "border-border hover:bg-muted"
            : "cursor-not-allowed border-border/50 opacity-50",
        )}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* 페이지 번호 버튼들 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => updatePage(pageNum)}
              disabled={isPending}
              className={cn(
                "flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted",
                isPending && "opacity-50",
              )}
              aria-label={`페이지 ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* 다음 페이지 버튼 */}
      <button
        type="button"
        onClick={() => updatePage(currentPage + 1)}
        disabled={!hasNextPage || isPending}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md border transition-colors",
          hasNextPage && !isPending
            ? "border-border hover:bg-muted"
            : "cursor-not-allowed border-border/50 opacity-50",
        )}
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

