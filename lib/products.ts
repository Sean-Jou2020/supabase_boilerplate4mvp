/**
 * @file products.ts
 * @description 상품 데이터 조회 함수
 *
 * Supabase products 테이블에서 활성 상품을 조회하는 함수들을 제공합니다.
 * Server Component에서 사용하기 위해 서버용 클라이언트를 사용합니다.
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

/**
 * 활성화된 모든 상품을 조회합니다.
 * @returns 활성화된 상품 목록 (is_active = true)
 * @throws 에러 발생 시 에러 메시지와 함께 에러를 던집니다.
 */
export async function getActiveProducts(): Promise<Product[]> {
  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase 환경 변수 확인:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      throw new Error(
        "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요."
      );
    }

    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      // 에러 객체의 모든 속성 확인
      const errorMessage = error.message || String(error);
      const errorDetails = error.details || "";
      const errorHint = error.hint || "";
      const errorCode = error.code || "";

      console.error("상품 조회 에러 상세:", {
        error: error,
        message: errorMessage,
        details: errorDetails,
        hint: errorHint,
        code: errorCode,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      // 에러 메시지 문자열 검사 (대소문자 구분 없이)
      const errorMessageLower = errorMessage.toLowerCase();
      
      // 테이블이 없는 경우
      if (
        errorMessageLower.includes("could not find the table") ||
        errorMessageLower.includes("relation") ||
        errorMessageLower.includes("does not exist") ||
        errorCode === "42P01" || // PostgreSQL: relation does not exist
        errorCode === "PGRST116" // PostgREST: relation not found
      ) {
        throw new Error(
          "products 테이블을 찾을 수 없습니다.\n\n" +
          "해결 방법:\n" +
          "1. Supabase Dashboard (https://supabase.com/dashboard) 접속\n" +
          "2. 프로젝트 선택 → SQL Editor 메뉴\n" +
          "3. supabase/migrations/20251103124856_create_shopping_mall_schema.sql 파일 내용 복사\n" +
          "4. SQL Editor에 붙여넣고 'Run' 클릭\n" +
          "5. 성공 메시지 확인 후 페이지 새로고침"
        );
      }

      // 권한 에러
      if (
        errorMessageLower.includes("permission denied") ||
        errorMessageLower.includes("rls") ||
        errorCode === "42501" // PostgreSQL: insufficient privilege
      ) {
        throw new Error(
          "데이터베이스 접근 권한이 없습니다.\n\n" +
          "해결 방법:\n" +
          "1. Supabase Dashboard에서 RLS가 비활성화되어 있는지 확인\n" +
          "2. 테이블 권한이 anon, authenticated, service_role에 부여되었는지 확인"
        );
      }

      // 네트워크/연결 에러
      if (
        errorMessageLower.includes("fetch") ||
        errorMessageLower.includes("network") ||
        errorMessageLower.includes("connection")
      ) {
        throw new Error(
          `Supabase 연결 실패: ${errorMessage}\n\n` +
          "환경 변수 NEXT_PUBLIC_SUPABASE_URL이 올바른지 확인해주세요."
        );
      }

      // 일반 에러
      throw new Error(
        `상품 조회 실패: ${errorMessage}${errorDetails ? `\n상세: ${errorDetails}` : ""}${errorHint ? `\n힌트: ${errorHint}` : ""}`
      );
    }

    if (!data) {
      return [];
    }

    return data.map((item) => ({
      ...item,
      price: Number(item.price),
      stock_quantity: Number(item.stock_quantity),
    })) as Product[];
  } catch (error) {
    console.error("getActiveProducts 에러:", error);
    throw error;
  }
}

/**
 * 선택된 카테고리 배열로 활성 상품을 필터링하여 조회합니다.
 * 빈 배열 또는 null/undefined가 전달되면 전체 활성 상품을 반환합니다.
 */
export async function getActiveProductsByCategories(
  categories?: string[] | null
): Promise<Product[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase 환경 변수 확인:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      throw new Error(
        "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요."
      );
    }

    const supabase = createClerkSupabaseClient();

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (categories && categories.length > 0) {
      query = query.in("category", categories);
    }

    const { data, error } = await query;

    if (error) {
      const errorMessage = error.message || String(error);
      const errorDetails = (error as any).details || "";
      const errorHint = (error as any).hint || "";
      const errorCode = (error as any).code || "";

      console.error("카테고리 필터 상품 조회 에러 상세:", {
        error,
        message: errorMessage,
        details: errorDetails,
        hint: errorHint,
        code: errorCode,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      throw new Error(
        `상품 조회 실패: ${errorMessage}${errorDetails ? `\n상세: ${errorDetails}` : ""}${errorHint ? `\n힌트: ${errorHint}` : ""}`
      );
    }

    if (!data) return [];

    return data.map((item) => ({
      ...item,
      price: Number(item.price),
      stock_quantity: Number(item.stock_quantity),
    })) as Product[];
  } catch (error) {
    console.error("getActiveProductsByCategories 에러:", error);
    throw error;
  }
}

