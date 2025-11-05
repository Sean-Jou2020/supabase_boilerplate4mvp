/**
 * @file product-image.tsx
 * @description 상품 이미지 컴포넌트
 *
 * 상품 이미지를 표시하고, 이미지가 없거나 로드 실패 시 대체 이미지를 표시합니다.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";

interface ProductImageProps {
  /**
   * 이미지 URL
   */
  imageUrl: string | null;
  /**
   * 이미지 alt 텍스트
   */
  alt: string;
  /**
   * 이미지 크기 (기본값: "lg")
   */
  size?: "sm" | "md" | "lg";
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 우선순위 로딩 여부
   */
  priority?: boolean;
}

/**
 * 상품 이미지 컴포넌트
 */
export function ProductImage({
  imageUrl,
  alt,
  size = "lg",
  className,
  priority = false,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const hasImageUrl = imageUrl && imageUrl.trim() !== "";

  if (!hasImageUrl || imageError) {
    return <ProductImagePlaceholder size={size} className={className} />;
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 768px) 100vw, 50vw"
      unoptimized={imageUrl.startsWith("http")}
      priority={priority}
      onError={() => setImageError(true)}
    />
  );
}
