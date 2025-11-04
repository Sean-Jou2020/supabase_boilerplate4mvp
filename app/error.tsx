/**
 * @file error.tsx
 * @description 에러 바운더리 페이지
 *
 * Next.js App Router의 Error Boundary 역할을 하는 페이지입니다.
 * 에러 발생 시 자동으로 표시되며, 재시도 기능을 제공합니다.
 *
 * 주의: 반드시 Client Component여야 합니다.
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 에러 페이지 컴포넌트
 * @param error - 발생한 에러 객체
 * @param reset - 에러 상태를 리셋하는 함수
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (선택사항)
    console.error("에러 발생:", error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16">
      <div className="mx-auto w-full max-w-2xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          문제가 발생했습니다
        </h1>

        <p className="mb-2 text-lg text-muted-foreground md:text-xl">
          죄송합니다. 페이지를 불러오는 중 오류가 발생했습니다.
        </p>

        {error.message && (
          <div className="mb-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-left">
            <p className="text-sm font-medium text-destructive">에러 메시지:</p>
            <p className="mt-1 text-sm text-destructive/80">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                에러 ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>

        <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-left">
          <h2 className="mb-2 font-semibold">문제가 계속되나요?</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• 페이지를 새로고침해보세요</li>
            <li>• 잠시 후 다시 시도해보세요</li>
            <li>• 문제가 지속되면 관리자에게 문의해주세요</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

