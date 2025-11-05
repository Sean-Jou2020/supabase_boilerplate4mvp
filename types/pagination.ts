/**
 * @file pagination.ts
 * @description 페이지네이션 관련 TypeScript 타입 정의
 *
 * 페이지네이션 파라미터 및 메타데이터 타입 정의
 */

/**
 * 페이지네이션 파라미터 인터페이스
 */
export interface PaginationParams {
  page: number;
  perPage: number; // 고정값 12
}

/**
 * 페이지네이션 메타데이터 인터페이스
 */
export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * 페이지네이션 결과 인터페이스
 * @template T - 페이지네이션된 데이터 타입
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

