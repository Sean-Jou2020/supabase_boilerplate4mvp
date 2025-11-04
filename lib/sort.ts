/**
 * @file sort.ts
 * @description 상품 정렬 옵션 상수/유틸리티
 */

export const SORT_OPTIONS = [
  "price_asc",
  "price_desc",
  "popular",
  "name_asc",
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number] | "";

export const SORT_LABELS: Record<SortValue, string> = {
  "": "기본순",
  price_asc: "가격 낮은순",
  price_desc: "가격 높은순",
  popular: "인기순",
  name_asc: "이름순",
};

/**
 * URL 쿼리 파라미터에서 정렬 옵션을 파싱합니다.
 * @param value - URL 쿼리 파라미터 값
 * @returns 유효한 정렬 옵션 또는 빈 문자열
 */
export function parseSortParam(
  value: string | string[] | undefined,
): SortValue {
  if (!value) return "";
  const str = Array.isArray(value) ? value[0] : value;
  if (!str) return "";
  const trimmed = str.trim();
  if (trimmed === "" || !(SORT_OPTIONS as readonly string[]).includes(trimmed)) {
    return "";
  }
  return trimmed as SortValue;
}

/**
 * 정렬 옵션을 URL 쿼리 문자열 값으로 직렬화합니다.
 * @param sort - 정렬 옵션 (빈 문자열이면 undefined 반환)
 * @returns URL 쿼리 문자열 값 또는 undefined
 */
export function serializeSort(sort: SortValue): string | undefined {
  return sort === "" ? undefined : sort;
}

