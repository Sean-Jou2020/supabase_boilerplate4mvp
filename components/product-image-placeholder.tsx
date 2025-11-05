/**
 * @file product-image-placeholder.tsx
 * @description 상품 이미지 플레이스홀더 컴포넌트
 *
 * 이미지가 없거나 로드 실패 시 표시되는 대체 이미지 컴포넌트
 */

import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImagePlaceholderProps {
  /**
   * 플레이스홀더 크기 (기본값: "md")
   */
  size?: "sm" | "md" | "lg";
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 상품 이미지 플레이스홀더 컴포넌트
 */
export function ProductImagePlaceholder({
  size = "md",
  className,
}: ProductImagePlaceholderProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-24 w-24",
  };

  return (
    <div
      className={cn(
        "flex h-full items-center justify-center text-muted-foreground",
        className,
      )}
    >
      <ImageIcon className={cn(sizeClasses[size])} />
    </div>
  );
}
