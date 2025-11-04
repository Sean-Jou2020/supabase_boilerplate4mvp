/**
 * @file categories.ts
 * @description 상품 카테고리 상수/유틸리티
 */

export const ALL_CATEGORIES = [
  "electronics",
  "clothing",
  "books",
  "food",
  "sports",
  "beauty",
  "home",
] as const;

export type CategoryValue = (typeof ALL_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CategoryValue, string> = {
  electronics: "전자제품",
  clothing: "의류",
  books: "도서",
  food: "식품",
  sports: "스포츠",
  beauty: "뷰티",
  home: "생활/가정",
};

/** 쉼표로 구분된 categories 쿼리에서 유효한 카테고리만 추출 */
export function parseCategoriesParam(value: string | string[] | undefined): CategoryValue[] {
  if (!value) return [];
  const str = Array.isArray(value) ? value.join(",") : value;
  if (!str) return [];
  const set = new Set(
    str
      .split(",")
      .map((v) => v.trim())
      .filter((v) => (ALL_CATEGORIES as readonly string[]).includes(v))
  );
  return Array.from(set) as CategoryValue[];
}

/** 카테고리 배열을 URL 쿼리 문자열 값으로 직렬화 */
export function serializeCategories(categories: string[]): string {
  return categories.join(",");
}


