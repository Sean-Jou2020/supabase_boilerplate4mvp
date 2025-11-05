/**
 * @file order.ts
 * @description 주문 관련 TypeScript 타입 정의
 *
 * orders 테이블과 order_items 테이블 스키마와 일치하는 타입 정의
 */

/**
 * 주문 상태 타입
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/**
 * 배송지 정보 인터페이스
 * shipping_address JSONB 필드 구조
 */
export interface ShippingAddress {
  recipient_name: string; // 수령인 이름
  recipient_phone: string; // 수령인 전화번호
  postal_code: string; // 우편번호
  address: string; // 주소
  detail_address?: string; // 상세주소 (선택)
}

/**
 * 주문 인터페이스
 * Supabase orders 테이블과 일치
 */
export interface Order {
  id: string;
  clerk_id: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress | null;
  order_note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 주문 상세 아이템 인터페이스
 * Supabase order_items 테이블과 일치
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

/**
 * 주문 생성 입력 데이터 인터페이스
 * createOrder Server Action의 입력 타입
 */
export interface CreateOrderInput {
  shipping_address: ShippingAddress;
  order_note?: string;
}

/**
 * 주문 생성 결과 타입
 */
export interface CreateOrderResult {
  success: boolean;
  message: string;
  orderId?: string;
}

