/**
 * @file product-sort.tsx
 * @description 상품 정렬 버튼 그룹 컴포넌트
 *
 * URL 쿼리 파라미터 기반으로 정렬 옵션을 선택할 수 있는 버튼 그룹입니다.
 * 현재 선택된 정렬 옵션은 강조 표시됩니다.
 */

"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_LABELS, type SortValue, serializeSort } from "@/lib/sort";
import { cn } from "@/lib/utils";

type Props = {
  selected: SortValue;
};

const SORT_OPTIONS: SortValue[] = ["", "price_asc", "price_desc", "popular", "name_asc"];

export function ProductSort({ selected }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateUrl = (nextSort: SortValue) => {
    const params = new URLSearchParams(searchParams?.toString());
    const sortValue = serializeSort(nextSort);
    if (sortValue) {
      params.set("sort", sortValue);
    } else {
      params.delete("sort");
    }
    const url = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    startTransition(() => router.push(url, { scroll: false }));
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {SORT_OPTIONS.map((value) => {
        const isActive = selected === value;
        return (
          <button
            key={value || "default"}
            type="button"
            onClick={() => updateUrl(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted",
            )}
            aria-pressed={isActive}
            disabled={isPending}
          >
            {SORT_LABELS[value]}
          </button>
        );
      })}
    </div>
  );
}

