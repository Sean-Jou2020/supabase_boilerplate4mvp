/**
 * @file cart-item.tsx
 * @description 장바구니 아이템 컴포넌트
 *
 * 장바구니 페이지에서 개별 아이템을 표시하고 수량 변경 및 삭제 기능을 제공합니다.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/types/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { updateCartItemQuantity, removeCartItem } from "@/actions/cart";

interface CartItemProps {
  item: CartItem;
}

/**
 * 장바구니 아이템 컴포넌트
 * @param item - 장바구니 아이템 정보
 */
export function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const subtotal = item.product.price * item.quantity;
  const hasImageUrl = item.product.image_url && item.product.image_url.trim() !== "";

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity === item.quantity) return;

    setIsUpdating(true);
    try {
      const result = await updateCartItemQuantity(item.id, newQuantity);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("수량 변경 에러:", error);
      alert("수량 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("장바구니에서 삭제하시겠습니까?")) return;

    setIsRemoving(true);
    try {
      const result = await removeCartItem(item.id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("장바구니 삭제 에러:", error);
      alert("장바구니 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
      {/* 상품 이미지 */}
      <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
        <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-32">
          {hasImageUrl ? (
            <Image
              src={item.product.image_url!}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized={item.product.image_url!.startsWith("http")}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
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
      </Link>

      {/* 상품 정보 */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <Link
              href={`/products/${item.product.id}`}
              className="text-lg font-semibold hover:underline"
            >
              {item.product.name}
            </Link>
            <p className="text-muted-foreground">
              {formatPrice(item.product.price)} × {item.quantity}개
            </p>
          </div>

          {/* 소계 */}
          <div className="text-right">
            <p className="text-lg font-bold">{formatPrice(subtotal)}</p>
          </div>
        </div>

        {/* 수량 변경 및 삭제 */}
        <div className="flex items-center gap-2">
          {/* 수량 변경 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-[2rem] text-center font-medium">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.product.stock_quantity < item.quantity + 1}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 삭제 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isRemoving}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

