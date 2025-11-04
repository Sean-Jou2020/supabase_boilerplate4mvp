/**
 * @file product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * 심플한 디자인의 상품 카드 컴포넌트
 * 이미지, 이름, 가격, 카테고리 정보를 표시합니다.
 * 이미지 로드 실패 시 플레이스홀더 아이콘을 표시합니다.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

/**
 * 상품 카드 컴포넌트
 * @param product - 표시할 상품 정보
 */
export function ProductCard({ product }: ProductCardProps) {
  // image_url이 실제로 존재하는지 확인
  const hasImageUrl = product.image_url && product.image_url.trim() !== "";
  const [imageError, setImageError] = useState(false);

  const categoryLabels: Record<string, string> = {
    electronics: "전자제품",
    clothing: "의류",
    books: "도서",
    food: "음식",
    sports: "스포츠",
    beauty: "뷰티",
    home: "홈",
    accessories: "액세서리",
    toys: "장난감",
    automotive: "자동차",
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all",
        "hover:shadow-md hover:scale-[1.02]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      {/* 상품 이미지 */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {hasImageUrl && !imageError ? (
          <Image
            src={product.image_url!}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={product.image_url!.startsWith("http")}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-col gap-2 p-4">
        {/* 카테고리 */}
        <span className="text-xs font-medium text-muted-foreground">
          {categoryLabels[product.category] || product.category}
        </span>

        {/* 상품명 */}
        <h3 className="line-clamp-2 font-semibold leading-tight text-foreground">
          {product.name}
        </h3>

        {/* 가격 */}
        <p className="text-lg font-bold text-primary">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

