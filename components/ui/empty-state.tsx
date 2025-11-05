/**
 * @file empty-state.tsx
 * @description 빈 상태 컴포넌트
 *
 * 데이터가 없을 때 빈 상태 메시지와 액션 버튼을 표시합니다.
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, Home, ShoppingBag } from "lucide-react";

type Props = {
  /**
   * 메시지 (기본값: "등록된 상품이 없습니다.")
   */
  message?: string;
  /**
   * 설명 문구 (선택적)
   */
  description?: string;
  /**
   * 액션 버튼 표시 여부 (기본값: true)
   */
  showAction?: boolean;
  /**
   * 액션 버튼 타입 (기본값: "home")
   */
  actionType?: "home" | "products" | "none";
};

/**
 * 빈 상태 컴포넌트
 */
export function EmptyState({
  message = "등록된 상품이 없습니다.",
  description,
  showAction = true,
  actionType = "home",
}: Props) {
  const getActionButton = () => {
    if (!showAction || actionType === "none") return null;

    if (actionType === "home") {
      return (
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </Button>
      );
    }

    if (actionType === "products") {
      return (
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/products">
            <ShoppingBag className="h-4 w-4" />
            전체 상품 보기
          </Link>
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="rounded-lg border p-12 text-center">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-muted p-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{message}</h3>
      {description && (
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      )}
      {getActionButton()}
    </div>
  );
}

