/**
 * @file product.ts
 * @description 상품 관련 TypeScript 타입 정의
 *
 * Supabase products 테이블 스키마와 일치하는 타입 정의
 */

/**
 * 상품 카테고리 타입
 */
export type ProductCategory =
  | "electronics"
  | "clothing"
  | "books"
  | "food"
  | "sports"
  | "beauty"
  | "home"
  | "accessories"
  | "toys"
  | "automotive";

/**
 * 상품 인터페이스
 * Supabase products 테이블과 일치
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  stock_quantity: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

