/**
 * @file product-search.tsx
 * @description 상품 검색 컴포넌트
 *
 * 검색어를 입력하고 검색 버튼을 클릭하거나 Enter 키를 눌러 상품을 검색할 수 있습니다.
 * URL 쿼리 파라미터 기반으로 검색어를 관리합니다.
 */

"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { serializeSearch } from "@/lib/search";

type Props = {
  initialValue?: string;
};

export function ProductSearch({ initialValue = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(initialValue);

  const updateUrl = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    const searchValue = serializeSearch(searchTerm);
    
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    
    // 검색 시 페이지를 1로 리셋
    params.delete("page");
    
    const url = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    startTransition(() => router.push(url, { scroll: false }));
  };

  const handleSearch = () => {
    updateUrl(searchValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchValue("");
    updateUrl("");
  };

  return (
    <div className="relative mb-6">
      <Input
        type="text"
        placeholder="상품명, 설명, 카테고리로 검색..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={searchValue ? "pr-20" : "pr-12"}
        disabled={isPending}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="검색어 초기화"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isPending}
          size="icon"
          className="h-7 w-7"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">검색</span>
        </Button>
      </div>
    </div>
  );
}

