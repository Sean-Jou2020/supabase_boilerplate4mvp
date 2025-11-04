/**
 * @file add-to-cart-button.tsx
 * @description 장바구니 추가 버튼 컴포넌트
 *
 * 상품 상세 페이지에서 장바구니에 상품을 추가하는 버튼입니다.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/actions/cart";

interface AddToCartButtonProps {
  product: Product;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 * @param product - 상품 정보
 */
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isOutOfStock = product.stock_quantity <= 0;
  const isInactive = !product.is_active;

  const handleClick = async () => {
    if (isOutOfStock || isInactive) return;

    setIsLoading(true);
    try {
      const result = await addToCart(product.id, 1);
      
      if (result.success) {
        // 성공 시 장바구니 페이지로 이동하거나 메시지 표시
        alert(result.message);
        router.refresh(); // 페이지 새로고침 (선택적)
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("장바구니 추가 에러:", error);
      alert("장바구니 추가 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
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
