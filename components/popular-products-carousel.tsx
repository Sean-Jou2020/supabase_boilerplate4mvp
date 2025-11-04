/**
 * @file popular-products-carousel.tsx
 * @description 인기상품 캐러슬 컴포넌트
 *
 * 무한 루프 캐러슬 형태로 인기상품을 표시합니다.
 * 마지막 카드에서 오른쪽을 누르면 첫 번째 카드로, 
 * 첫 번째 카드에서 왼쪽을 누르면 마지막 카드로 순환합니다.
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PopularProductsCarouselProps {
  products: Product[];
}

/**
 * 인기상품 무한 루프 캐러슬 컴포넌트
 * @param products - 표시할 인기상품 목록
 */
export function PopularProductsCarousel({ products }: PopularProductsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 무한 루프를 위해 카드를 3배로 복제: [...products, ...products, ...products]
  const extendedProducts = [...products, ...products, ...products];

  // 카드 너비 계산 (gap 포함)
  const getCardWidth = () => {
    if (typeof window === "undefined") return 320;
    if (window.innerWidth >= 1024) return 320 + 24; // lg + gap
    if (window.innerWidth >= 768) return 300 + 24; // md + gap
    return 280 + 24; // sm + gap
  };

  // 특정 인덱스로 스크롤
  const scrollToIndex = (index: number, smooth: boolean = true) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cardWidth = getCardWidth();
    const scrollPosition = index * cardWidth;

    container.scrollTo({
      left: scrollPosition,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // 초기 위치 설정 (중간 섹션의 첫 번째 카드)
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToIndex(products.length, false);
      setCurrentIndex(0);
    }, 100);

    return () => clearTimeout(timer);
  }, [products.length]);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isTransitioning) return;

      const cardWidth = getCardWidth();
      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);

      // 첫 번째 섹션의 끝에 도달하면 중간 섹션으로 점프
      if (newIndex < products.length * 0.5) {
        setIsTransitioning(true);
        const targetIndex = newIndex + products.length;
        scrollToIndex(targetIndex, false);
        setCurrentIndex(newIndex);
        setTimeout(() => setIsTransitioning(false), 50);
      }
      // 세 번째 섹션의 끝에 도달하면 중간 섹션으로 점프
      else if (newIndex >= products.length * 2.5) {
        setIsTransitioning(true);
        const targetIndex = newIndex - products.length;
        scrollToIndex(targetIndex, false);
        setCurrentIndex(newIndex - products.length * 2);
        setTimeout(() => setIsTransitioning(false), 50);
      } else {
        // 중간 섹션에 있을 때
        const relativeIndex = newIndex - products.length;
        setCurrentIndex(relativeIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [products.length, isTransitioning]);

  // 리사이즈 이벤트 처리
  useEffect(() => {
    const handleResize = () => {
      if (!scrollContainerRef.current) return;
      // 현재 인덱스 기준으로 위치 재조정
      const actualIndex = products.length + currentIndex;
      scrollToIndex(actualIndex, false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [products.length, currentIndex]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current || isTransitioning) return;

    setIsTransitioning(true);

    const container = scrollContainerRef.current;
    const cardWidth = getCardWidth();
    const currentScroll = container.scrollLeft;
    const currentScrollIndex = Math.round(currentScroll / cardWidth);

    const nextIndex = direction === "left" 
      ? currentScrollIndex - 1 
      : currentScrollIndex + 1;

    scrollToIndex(nextIndex, true);

    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div className="relative">
      {/* 좌측 스크롤 버튼 - 무한 루프이므로 항상 표시 */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm",
          "hover:bg-background/90",
          "flex"
        )}
        onClick={() => scroll("left")}
        aria-label="이전 상품 보기"
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 캐러슬 컨테이너 */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
      >
        {extendedProducts.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="min-w-[280px] flex-shrink-0 sm:min-w-[300px] md:min-w-[320px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* 우측 스크롤 버튼 - 무한 루프이므로 항상 표시 */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm",
          "hover:bg-background/90",
          "flex"
        )}
        onClick={() => scroll("right")}
        aria-label="다음 상품 보기"
        disabled={isTransitioning}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

