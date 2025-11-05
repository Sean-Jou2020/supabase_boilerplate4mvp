/**
 * @file error-state.tsx
 * @description 에러 상태 컴포넌트
 *
 * 데이터 조회 실패 시 에러 메시지와 재시도 버튼을 표시합니다.
 */

"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = {
  /**
   * 에러 메시지
   */
  message?: string;
  /**
   * 재시도 함수 (선택적)
   */
  onRetry?: () => void;
  /**
   * 기본 에러 메시지 (기본값: "데이터를 불러오는 중 오류가 발생했습니다.")
   */
  defaultMessage?: string;
};

/**
 * 에러 상태 컴포넌트
 */
export function ErrorState({
  message,
  onRetry,
  defaultMessage = "데이터를 불러오는 중 오류가 발생했습니다.",
}: Props) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
      </div>
      <p className="mb-4 text-destructive">{message || defaultMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </Button>
      )}
    </div>
  );
}

