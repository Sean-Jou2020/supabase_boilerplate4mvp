/**
 * @file order.ts
 * @description 주문 관련 Server Actions
 *
 * 주문 생성 기능을 제공합니다.
 * Clerk 인증을 사용하여 사용자별 주문을 관리합니다.
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getCartItems } from "@/actions/cart";
import type { CreateOrderInput, CreateOrderResult } from "@/types/order";

/**
 * 주문 생성
 * @param input - 주문 생성 입력 데이터 (배송지 정보, 주문 메모)
 * @returns 주문 생성 결과
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  try {
    console.group("[createOrder] 주문 생성 시작");
    console.log("입력 데이터:", input);

    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.error("[createOrder] 인증 실패: 로그인이 필요합니다.");
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }
    console.log("[createOrder] 사용자 인증 확인:", userId);

    // 장바구니 아이템 조회
    const cartItems = await getCartItems();
    console.log("[createOrder] 장바구니 아이템 수:", cartItems.length);

    if (cartItems.length === 0) {
      console.error("[createOrder] 장바구니가 비어있습니다.");
      return {
        success: false,
        message: "장바구니가 비어있습니다.",
      };
    }

    // 총 금액 계산
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    console.log("[createOrder] 총 금액:", totalAmount);

    // 상품 활성화 및 재고 확인
    for (const item of cartItems) {
      if (!item.product.is_active) {
        return {
          success: false,
          message: `판매 중지된 상품이 있습니다: ${item.product.name}`,
        };
      }
      if (item.product.stock_quantity < item.quantity) {
        return {
          success: false,
          message: `재고가 부족한 상품이 있습니다: ${item.product.name} (재고: ${item.product.stock_quantity}개, 주문: ${item.quantity}개)`,
        };
      }
    }

    const supabase = createClerkSupabaseClient();

    // 주문 생성 (orders 테이블)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        clerk_id: userId,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: input.shipping_address,
        order_note: input.order_note || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("[createOrder] 주문 생성 실패:", orderError);
      return {
        success: false,
        message: "주문 생성에 실패했습니다.",
      };
    }
    console.log("[createOrder] 주문 생성 성공, 주문 ID:", order.id);

    // 주문 상세 아이템 생성 (order_items 테이블)
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("[createOrder] 주문 상세 생성 실패:", orderItemsError);
      // 주문이 이미 생성되었으므로 롤백해야 함
      // 하지만 현재는 단순히 에러만 반환 (Phase 4에서 트랜잭션 처리 고려)
      await supabase.from("orders").delete().eq("id", order.id);
      return {
        success: false,
        message: "주문 상세 정보 저장에 실패했습니다.",
      };
    }
    console.log("[createOrder] 주문 상세 생성 성공, 아이템 수:", orderItems.length);

    console.groupEnd();

    return {
      success: true,
      message: "주문이 성공적으로 생성되었습니다.",
      orderId: order.id,
    };
  } catch (error) {
    console.error("[createOrder] 예상치 못한 에러:", error);
    return {
      success: false,
      message: "주문 생성 중 오류가 발생했습니다.",
    };
  }
}

