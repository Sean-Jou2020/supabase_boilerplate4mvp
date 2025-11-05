/**
 * @file page.tsx
 * @description 장바구니 페이지
 *
 * 사용자의 장바구니 아이템을 표시하고, 수량 변경 및 삭제 기능을 제공합니다.
 * 총 금액을 계산하여 표시합니다.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCartItems } from "@/actions/cart";
import { CartItem } from "@/components/cart-item";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

/**
 * 장바구니 페이지
 */
export default async function CartPage() {
  // Clerk 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 장바구니 아이템 조회
  const cartItems = await getCartItems();

  // 총 금액 계산
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto w-full max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">장바구니</h1>
          <p className="text-muted-foreground">
            {cartItems.length > 0
              ? `${totalQuantity}개의 상품이 담겨있습니다`
              : "장바구니가 비어있습니다"}
          </p>
        </div>

        {/* 장바구니 아이템 목록 */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">장바구니가 비어있습니다</h2>
            <p className="mb-6 text-muted-foreground">
              쇼핑을 시작하려면 상품을 추가해보세요
            </p>
            <Link href="/products">
              <Button>상품 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* 총 금액 및 주문하기 */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center justify-between border-b pb-4">
                <span className="text-lg font-semibold">총 금액</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <div className="mb-4 text-sm text-muted-foreground">
                총 {totalQuantity}개 상품
              </div>
              <div className="flex gap-4">
                <Link href="/products" className="flex-1">
                  <Button variant="outline" className="w-full">
                    계속 쇼핑하기
                  </Button>
                </Link>
                <Link href="/checkout" className="flex-1">
                  <Button size="lg" className="w-full">
                    주문하기
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

