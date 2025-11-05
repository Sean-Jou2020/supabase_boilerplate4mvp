/**
 * @file pagination.ts
 * @description 페이지네이션 유틸리티 함수
 *
 * URL 쿼리 파라미터 파싱 및 페이지네이션 메타데이터 생성 함수
 */

import type { PaginationMeta } from "@/types/pagination";

/**
 * 페이지당 아이템 수 (고정값)
 */
export const PER_PAGE = 12;

/**
 * URL 쿼리 파라미터에서 페이지 번호를 파싱합니다.
 * @param value - URL 쿼리 파라미터 값
 * @returns 페이지 번호 (기본값: 1)
 */
export function parsePageParam(
  value: string | string[] | undefined,
): number {
  if (!value) return 1;
  const str = Array.isArray(value) ? value[0] : value;
  if (!str) return 1;
  const parsed = parseInt(str.trim(), 10);
  // 유효한 양수인지 확인
  if (isNaN(parsed) || parsed < 1) return 1;
  return parsed;
}

/**
 * 페이지네이션 메타데이터를 생성합니다.
 * @param currentPage - 현재 페이지 번호
 * @param totalItems - 전체 아이템 수
 * @param perPage - 페이지당 아이템 수 (기본값: 12)
 * @returns 페이지네이션 메타데이터
 */
export function createPaginationMeta(
  currentPage: number,
  totalItems: number,
  perPage: number = PER_PAGE,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  return {
    currentPage: safeCurrentPage,
    perPage,
    totalItems,
    totalPages,
    hasNextPage: safeCurrentPage < totalPages,
    hasPrevPage: safeCurrentPage > 1,
  };
}

