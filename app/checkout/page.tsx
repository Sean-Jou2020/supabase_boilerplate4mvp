/**
 * @file page.tsx
 * @description 주문 페이지
 *
 * 사용자의 장바구니 아이템을 확인하고 주문 정보를 입력받는 페이지입니다.
 * 배송지 정보와 주문 메모를 입력받아 주문을 생성합니다.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCartItems } from "@/actions/cart";
import { CheckoutForm } from "@/components/checkout-form";

/**
 * 주문 페이지
 */
export default async function CheckoutPage() {
  // Clerk 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 장바구니 아이템 조회
  const cartItems = await getCartItems();

  // 장바구니가 비어있으면 장바구니 페이지로 리다이렉트
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  // 총 금액 계산
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto w-full max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">주문하기</h1>
          <p className="text-muted-foreground">
            배송지 정보를 입력하고 주문을 완료해주세요.
          </p>
        </div>

        {/* 주문 폼 */}
        <CheckoutForm cartItems={cartItems} totalAmount={totalAmount} />
      </div>
    </main>
  );
}

