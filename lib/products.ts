/**
 * @file products.ts
 * @description 상품 데이터 조회 함수
 *
 * Supabase products 테이블에서 활성 상품을 조회하는 함수들을 제공합니다.
 * Server Component에서 사용하기 위해 서버용 클라이언트를 사용합니다.
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";
import type { SortValue } from "@/lib/sort";
import { PER_PAGE } from "@/lib/pagination";

/**
 * 정렬 옵션에 따른 Supabase 쿼리 order 조건을 적용합니다.
 * @param query - Supabase 쿼리 객체
 * @param sort - 정렬 옵션
 * @returns 정렬이 적용된 쿼리 객체
 */
function applySortOrder(query: any, sort: SortValue) {
  switch (sort) {
    case "price_asc":
      return query.order("price", { ascending: true });
    case "price_desc":
      return query.order("price", { ascending: false });
    case "popular":
      // MVP 단계: 최신순으로 임시 구현
      // 추후: order_items 테이블 조인하여 주문 수 기반으로 변경 예정
      return query.order("created_at", { ascending: false });
    case "name_asc":
      return query.order("name", { ascending: true });
    default:
      // 기본값: 최신순
      return query.order("created_at", { ascending: false });
  }
}

/**
 * 활성화된 모든 상품을 조회합니다.
 * @param sort - 정렬 옵션 (기본값: "", 최신순)
 * @param page - 페이지 번호 (기본값: 1)
 * @param perPage - 페이지당 아이템 수 (기본값: 12)
 * @returns 활성화된 상품 목록 (is_active = true)
 * @throws 에러 발생 시 에러 메시지와 함께 에러를 던집니다.
 */
export async function getActiveProducts(
  sort: SortValue = "",
  page?: number,
  perPage: number = PER_PAGE,
): Promise<Product[]> {
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
        "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.",
      );
    }

    const supabase = createClerkSupabaseClient();

    let query = supabase.from("products").select("*").eq("is_active", true);

    query = applySortOrder(query, sort);

    // 페이지네이션 적용 (page가 제공된 경우에만)
    if (page !== undefined && page !== null) {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

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
            "5. 성공 메시지 확인 후 페이지 새로고침",
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
            "2. 테이블 권한이 anon, authenticated, service_role에 부여되었는지 확인",
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
            "환경 변수 NEXT_PUBLIC_SUPABASE_URL이 올바른지 확인해주세요.",
        );
      }

      // 일반 에러
      throw new Error(
        `상품 조회 실패: ${errorMessage}${
          errorDetails ? `\n상세: ${errorDetails}` : ""
        }${errorHint ? `\n힌트: ${errorHint}` : ""}`,
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
 * @param categories - 카테고리 배열
 * @param sort - 정렬 옵션 (기본값: "", 최신순)
 * @param page - 페이지 번호 (기본값: 1)
 * @param perPage - 페이지당 아이템 수 (기본값: 12)
 * @returns 필터링된 상품 목록
 */
export async function getActiveProductsByCategories(
  categories?: string[] | null,
  sort: SortValue = "",
  page?: number,
  perPage: number = PER_PAGE,
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
        "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.",
      );
    }

    const supabase = createClerkSupabaseClient();

    let query = supabase.from("products").select("*").eq("is_active", true);

    if (categories && categories.length > 0) {
      query = query.in("category", categories);
    }

    query = applySortOrder(query, sort);

    // 페이지네이션 적용 (page가 제공된 경우에만)
    if (page !== undefined && page !== null) {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);
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
        `상품 조회 실패: ${errorMessage}${
          errorDetails ? `\n상세: ${errorDetails}` : ""
        }${errorHint ? `\n힌트: ${errorHint}` : ""}`,
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

/**
 * 인기 상품을 조회합니다.
 * MVP 단계에서는 최신 상품 중 상위 N개를 인기상품으로 표시합니다.
 * 추후 주문 수 또는 조회 수 기반으로 변경 가능합니다.
 * @param limit - 조회할 상품 수 (기본값: 8)
 * @returns 인기 상품 목록
 */
export async function getPopularProducts(
  limit: number = 8,
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
        "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.",
      );
    }

    const supabase = createClerkSupabaseClient();

    // MVP 단계: 최신 상품 중 상위 N개를 인기상품으로 표시
    // 추후: 주문 수(order_items) 또는 조회 수 기반으로 변경 가능
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      const errorMessage = error.message || String(error);
      const errorDetails = (error as any).details || "";
      const errorHint = (error as any).hint || "";
      const errorCode = (error as any).code || "";

      console.error("인기 상품 조회 에러 상세:", {
        error,
        message: errorMessage,
        details: errorDetails,
        hint: errorHint,
        code: errorCode,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      throw new Error(
        `인기 상품 조회 실패: ${errorMessage}${
          errorDetails ? `\n상세: ${errorDetails}` : ""
        }${errorHint ? `\n힌트: ${errorHint}` : ""}`,
      );
    }

    if (!data) return [];

    return data.map((item) => ({
      ...item,
      price: Number(item.price),
      stock_quantity: Number(item.stock_quantity),
    })) as Product[];
  } catch (error) {
    console.error("getPopularProducts 에러:", error);
    throw error;
  }
}

/**
 * 상품 ID로 단일 상품을 조회합니다.
 * 비활성화된 상품(is_active = false)도 조회 가능합니다.
 * @param id - 상품 ID (UUID)
 * @returns 상품 정보 또는 null (상품이 없을 경우)
 * @throws 에러 발생 시 에러 메시지와 함께 에러를 던집니다.
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase 환경 변수 확인:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      throw new Error(
        "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.",
      );
    }

    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      const errorMessage = error.message || String(error);
      const errorCode = (error as any).code || "";

      // 상품을 찾을 수 없는 경우 (PGRST116: PostgREST single row not found)
      if (errorCode === "PGRST116" || errorMessage.includes("No rows")) {
        return null;
      }

      console.error("상품 조회 에러 상세:", {
        error,
        message: errorMessage,
        code: errorCode,
        id,
      });

      throw new Error(`상품 조회 실패: ${errorMessage}`);
    }

    if (!data) return null;

    return {
      ...data,
      price: Number(data.price),
      stock_quantity: Number(data.stock_quantity),
    } as Product;
  } catch (error) {
    console.error("getProductById 에러:", error);
    throw error;
  }
}

/**
 * 활성화된 상품의 총 개수를 조회합니다.
 * @param categories - 카테고리 배열 (선택적, 필터링 시 사용)
 * @returns 활성화된 상품의 총 개수
 * @throws 에러 발생 시 에러 메시지와 함께 에러를 던집니다.
 */
export async function getActiveProductsCount(
  categories?: string[] | null,
): Promise<number> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase 환경 변수 확인:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      throw new Error(
        "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.",
      );
    }

    const supabase = createClerkSupabaseClient();

    // count 쿼리: id 컬럼만 선택하여 효율성 향상
    let query = supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    if (categories && categories.length > 0) {
      query = query.in("category", categories);
    }

    const { count, error } = await query;

    if (error) {
      const errorMessage = error.message || String(error);
      const errorDetails = (error as any).details || "";
      const errorHint = (error as any).hint || "";
      const errorCode = (error as any).code || "";

      console.error("상품 개수 조회 에러 상세:", {
        error,
        message: errorMessage,
        details: errorDetails,
        hint: errorHint,
        code: errorCode,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      throw new Error(
        `상품 개수 조회 실패: ${errorMessage}${
          errorDetails ? `\n상세: ${errorDetails}` : ""
        }${errorHint ? `\n힌트: ${errorHint}` : ""}`,
      );
    }

    // count가 null이거나 undefined일 수 있으므로 명시적으로 처리
    const result = count ?? 0;

    return result;
  } catch (error) {
    console.error("getActiveProductsCount 에러:", error);
    throw error;
  }
}
