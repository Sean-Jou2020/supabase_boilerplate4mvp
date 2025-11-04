/**
 * @file add-to-cart-button.tsx
 * @description 장바구니 추가 버튼 컴포넌트 (UI만)
 *
 * Phase 3에서 장바구니 기능과 연결 예정입니다.
 * 현재는 UI만 구현하며, 클릭 시 안내 메시지를 표시합니다.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: Product;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 * Phase 3에서 실제 기능 연결 예정
 * @param product - 상품 정보
 */
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isOutOfStock = product.stock_quantity <= 0;
  const isInactive = !product.is_active;

  const handleClick = async () => {
    if (isOutOfStock || isInactive) return;

    setIsLoading(true);
    // Phase 3에서 실제 장바구니 추가 기능 연결 예정
    // 현재는 임시로 안내 메시지 표시
    console.log("장바구니 추가 (Phase 3에서 구현 예정):", product.id);
    
    // 임시: 토스트 메시지 또는 알림 표시
    setTimeout(() => {
      setIsLoading(false);
      alert("장바구니 기능은 Phase 3에서 구현 예정입니다.");
    }, 500);
  };

  if (isInactive) {
    return (
      <Button size="lg" disabled className="w-full">
        판매 중지
      </Button>
    );
  }

  if (isOutOfStock) {
    return (
      <Button size="lg" disabled variant="secondary" className="w-full">
        품절
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <span className="mr-2">처리 중...</span>
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          장바구니에 추가
        </>
      )}
    </Button>
  );
}

