/**
 * @file cart.ts
 * @description 장바구니 관련 Server Actions
 *
 * 장바구니 추가/조회/수량 변경/삭제 기능을 제공합니다.
 * Clerk 인증을 사용하여 사용자별 장바구니를 관리합니다.
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/products";
import type { CartItem } from "@/types/cart";

/**
 * 장바구니에 상품 추가
 * @param productId - 추가할 상품 ID
 * @param quantity - 추가할 수량 (기본값: 1)
 * @returns 성공 여부 및 메시지
 */
export async function addToCart(
  productId: string,
  quantity: number = 1,
): Promise<{ success: boolean; message: string }> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    // 상품 정보 조회
    const product = await getProductById(productId);
    if (!product) {
      return {
        success: false,
        message: "상품을 찾을 수 없습니다.",
      };
    }

    // 상품 활성화 확인
    if (!product.is_active) {
      return {
        success: false,
        message: "판매 중지된 상품입니다.",
      };
    }

    // 재고 확인
    if (product.stock_quantity < quantity) {
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    const supabase = createClerkSupabaseClient();

    // 기존 장바구니 아이템 확인
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .single();

    if (existingItem) {
      // 이미 장바구니에 있으면 수량 증가
      const newQuantity = existingItem.quantity + quantity;

      // 재고 확인
      if (product.stock_quantity < newQuantity) {
        return {
          success: false,
          message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개, 장바구니: ${existingItem.quantity}개)`,
        };
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id);

      if (error) {
        console.error("장바구니 수량 업데이트 에러:", error);
        return {
          success: false,
          message: "장바구니 수량 업데이트에 실패했습니다.",
        };
      }

      return {
        success: true,
        message: "장바구니에 추가되었습니다.",
      };
    } else {
      // 새로 추가
      const { error } = await supabase.from("cart_items").insert({
        clerk_id: userId,
        product_id: productId,
        quantity,
      });

      if (error) {
        console.error("장바구니 추가 에러:", error);
        return {
          success: false,
          message: "장바구니 추가에 실패했습니다.",
        };
      }

      return {
        success: true,
        message: "장바구니에 추가되었습니다.",
      };
    }
  } catch (error) {
    console.error("addToCart 에러:", error);
    return {
      success: false,
      message: "장바구니 추가 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 장바구니 아이템 조회
 * @returns 장바구니 아이템 목록
 */
export async function getCartItems(): Promise<CartItem[]> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const supabase = createClerkSupabaseClient();

    // cart_items와 products 조인하여 조회
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        clerk_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (*)
      `,
      )
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("장바구니 조회 에러:", error);
      return [];
    }

    if (!data) return [];

    // 데이터 변환: products를 product로 변환
    return data.map((item: any) => ({
      id: item.id,
      clerk_id: item.clerk_id,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      created_at: item.created_at,
      updated_at: item.updated_at,
      product: {
        ...item.products,
        price: Number(item.products.price),
        stock_quantity: Number(item.products.stock_quantity),
      },
    })) as CartItem[];
  } catch (error) {
    console.error("getCartItems 에러:", error);
    return [];
  }
}

/**
 * 장바구니 아이템 수량 변경
 * @param cartItemId - 장바구니 아이템 ID
 * @param quantity - 변경할 수량 (1 이상)
 * @returns 성공 여부 및 메시지
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<{ success: boolean; message: string }> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    // 수량 검증
    if (quantity < 1) {
      return {
        success: false,
        message: "수량은 1개 이상이어야 합니다.",
      };
    }

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 조회 (본인 소유 확인)
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*, products (*)")
      .eq("id", cartItemId)
      .eq("clerk_id", userId)
      .single();

    if (fetchError || !cartItem) {
      return {
        success: false,
        message: "장바구니 아이템을 찾을 수 없습니다.",
      };
    }

    // 재고 확인
    const product = cartItem.products as any;
    if (product.stock_quantity < quantity) {
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 수량 업데이트
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (error) {
      console.error("장바구니 수량 변경 에러:", error);
      return {
        success: false,
        message: "수량 변경에 실패했습니다.",
      };
    }

    return {
      success: true,
      message: "수량이 변경되었습니다.",
    };
  } catch (error) {
    console.error("updateCartItemQuantity 에러:", error);
    return {
      success: false,
      message: "수량 변경 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 장바구니 아이템 삭제
 * @param cartItemId - 삭제할 장바구니 아이템 ID
 * @returns 성공 여부 및 메시지
 */
export async function removeCartItem(
  cartItemId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = createClerkSupabaseClient();

    // 장바구니 아이템 삭제 (본인 소유 확인)
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (error) {
      console.error("장바구니 삭제 에러:", error);
      return {
        success: false,
        message: "장바구니에서 삭제에 실패했습니다.",
      };
    }

    return {
      success: true,
      message: "장바구니에서 삭제되었습니다.",
    };
  } catch (error) {
    console.error("removeCartItem 에러:", error);
    return {
      success: false,
      message: "장바구니 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 장바구니 전체 비우기
 * @returns 성공 여부 및 메시지
 */
export async function clearCart(): Promise<{ success: boolean; message: string }> {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = createClerkSupabaseClient();

    // 장바구니 전체 삭제
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("clerk_id", userId);

    if (error) {
      console.error("장바구니 전체 삭제 에러:", error);
      return {
        success: false,
        message: "장바구니 비우기에 실패했습니다.",
      };
    }

    return {
      success: true,
      message: "장바구니가 비워졌습니다.",
    };
  } catch (error) {
    console.error("clearCart 에러:", error);
    return {
      success: false,
      message: "장바구니 비우기 중 오류가 발생했습니다.",
    };
  }
}

