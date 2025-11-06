/**
 * @file search.ts
 * @description 상품 검색 쿼리 파라미터 처리 유틸리티
 *
 * URL 쿼리 파라미터에서 검색어를 파싱하고 직렬화하는 함수들을 제공합니다.
 */

/**
 * URL 쿼리 파라미터에서 검색어를 파싱합니다.
 * @param value - URL 쿼리 파라미터 값
 * @returns 검색어 (없으면 빈 문자열)
 */
export function parseSearchParam(
  value: string | string[] | undefined,
): string {
  if (!value) return "";
  const str = Array.isArray(value) ? value[0] : value;
  if (!str) return "";
  return str.trim();
}

/**
 * 검색어를 URL 쿼리 문자열 값으로 직렬화합니다.
 * @param search - 검색어 (빈 문자열이면 undefined 반환)
 * @returns URL 쿼리 문자열 값 또는 undefined
 */
export function serializeSearch(search: string): string | undefined {
  const trimmed = search.trim();
  return trimmed === "" ? undefined : trimmed;
}

