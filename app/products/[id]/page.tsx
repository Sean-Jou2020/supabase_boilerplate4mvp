/**
 * @file page.tsx
 * @description 상품 상세 페이지
 *
 * 상품 ID로 상품 정보를 조회하여 상세 정보를 표시합니다.
 * 비활성화된 상품이나 존재하지 않는 상품에 대한 안내 메시지도 제공합니다.
 */

import { getProductById } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import { CATEGORY_LABELS } from "@/lib/categories";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 상품 상세 페이지
 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  // 상품이 없는 경우
  if (!product) {
    return (
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
            <h1 className="mb-4 text-2xl font-bold text-destructive md:text-3xl">
              상품을 찾을 수 없습니다
            </h1>
            <p className="mb-8 text-muted-foreground">
              요청하신 상품이 존재하지 않거나 삭제되었습니다.
            </p>
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                상품 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isInactive = !product.is_active;
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto w-full max-w-7xl">
        {/* 뒤로가기 버튼 */}
        <Link href="/products" className="mb-6 inline-flex items-center">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            상품 목록으로
          </Button>
        </Link>

        {/* 상품 상세 정보 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
          {/* 상품 이미지 */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
            <ProductImage
              imageUrl={product.image_url}
              alt={product.name}
              size="lg"
              className="object-cover"
              priority
            />
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col gap-6">
            {/* 카테고리 */}
            <span className="inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {categoryLabel}
            </span>

            {/* 상품명 */}
            <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>

            {/* 가격 */}
            <p className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>

            {/* 재고 상태 */}
            <div className="flex items-center gap-4">
              {isOutOfStock ? (
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                  품절
                </span>
              ) : (
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
                  재고: {product.stock_quantity}개
                </span>
              )}
              {isInactive && (
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                  판매 중지
                </span>
              )}
            </div>

            {/* 상품 설명 */}
            {product.description && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h2 className="mb-2 text-lg font-semibold">상품 설명</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* 장바구니 버튼 */}
            <div className="mt-4">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
