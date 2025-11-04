/**
 * @file cart.ts
 * @description 장바구니 관련 TypeScript 타입 정의
 *
 * cart_items 테이블과 products 테이블 조인 결과를 위한 타입 정의
 */

import type { Product } from "./product";

/**
 * 장바구니 아이템 인터페이스
 * cart_items 테이블과 products 테이블을 조인한 결과
 */
export interface CartItem {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // products 테이블 조인 결과
  product: Product;
}

/**
 * 장바구니 아이템 소계 (계산용)
 */
export interface CartItemSummary {
  cartItem: CartItem;
  subtotal: number; // product.price × quantity
}

/**
 * 장바구니 요약 정보
 */
export interface CartSummary {
  items: CartItem[];
  totalQuantity: number; // 전체 아이템 수량 합계
  totalAmount: number; // 전체 금액 합계
}

