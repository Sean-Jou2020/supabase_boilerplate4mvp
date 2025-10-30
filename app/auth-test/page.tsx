"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { createSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LuShield, LuCheck, LuX, LuTriangleAlert } from "react-icons/lu";
import Link from "next/link";

// 사용자 데이터 타입이 필요해지면 아래 인터페이스를 복원하세요.
// interface UserData {
//   id: string;
//   clerk_id: string;
//   name: string;
//   created_at: string;
// }

function AuthTestInner() {
  const supabase = createSupabaseClient();

  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  // Supabase 연결 테스트
  const testConnection = useCallback(async () => {
    try {
      setConnectionStatus("testing");
      setError(null);

      // 간단한 쿼리로 연결 테스트 (테이블이 없어도 연결은 확인 가능)
      const { error } = await supabase.from("users").select("count").limit(1);

      if (error) {
        // RLS나 권한 에러는 무시하고 연결만 확인
        if (
          error.message.includes("permission denied") ||
          error.message.includes("RLS")
        ) {
          setConnectionStatus("success");
          setError(
            "테이블 권한이 없지만 연결은 성공했습니다. schema.sql을 실행해주세요.",
          );
          return;
        }
        throw error;
      }

      setConnectionStatus("success");
    } catch (err) {
      setConnectionStatus("error");
      setError(err instanceof Error ? err.message : "연결 테스트 실패");
      console.error("Connection test error:", err);
    }
  }, [supabase]);

  // 페이지 로드 시 자동 테스트
  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← 홈으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold mb-2">Supabase 연결 테스트</h1>
        <p className="text-gray-600">
          Supabase 데이터베이스 연결 상태를 테스트합니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <LuTriangleAlert className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">에러</h3>
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-2">
              💡 <strong>해결 방법:</strong>
              <br />
              1. Supabase URL과 API 키가 올바르게 설정되었는지 확인
              <br />
              2. 인터넷 연결 상태 확인
              <br />
              3. Supabase 프로젝트가 활성화 상태인지 확인
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="text-red-600"
          >
            닫기
          </Button>
        </div>
      )}

      {/* 연결 상태 */}
      <div className="mb-8 p-6 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Supabase 연결 상태</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={connectionStatus === "testing"}
          >
            {connectionStatus === "testing" ? "테스트 중..." : "다시 테스트"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {connectionStatus === "idle" && (
            <>
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-gray-600">대기 중</span>
            </>
          )}
          {connectionStatus === "testing" && (
            <>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-600">연결 테스트 중...</span>
            </>
          )}
          {connectionStatus === "success" && (
            <>
              <LuCheck className="w-6 h-6 text-green-600" />
              <span className="text-green-600 font-semibold">연결 성공!</span>
            </>
          )}
          {connectionStatus === "error" && (
            <>
              <LuX className="w-6 h-6 text-red-600" />
              <span className="text-red-600 font-semibold">연결 실패</span>
            </>
          )}
        </div>
      </div>

      {/* 환경 변수 정보 */}
      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <LuShield className="w-6 h-6" />
          환경 변수 설정 상태
        </h2>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="font-semibold min-w-[200px]">SUPABASE_URL:</span>
            <span
              className={
                process.env.NEXT_PUBLIC_SUPABASE_URL
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {process.env.NEXT_PUBLIC_SUPABASE_URL
                ? "✅ 설정됨"
                : "❌ 설정되지 않음"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold min-w-[200px]">
              SUPABASE_ANON_KEY:
            </span>
            <span
              className={
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                ? "✅ 설정됨"
                : "❌ 설정되지 않음"}
            </span>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold mb-2">💡 이 페이지의 작동 원리</h3>
        <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
          <li>
            Supabase 클라이언트를 사용하여 데이터베이스 연결을 테스트합니다
          </li>
          <li>환경 변수가 올바르게 설정되었는지 확인합니다</li>
          <li>인터넷 연결과 Supabase 프로젝트 상태를 검증합니다</li>
          <li>현재 Clerk 통합 없이 Supabase만 사용합니다</li>
        </ul>
      </div>
    </div>
  );
}

// 브라우저 확장프로그램이 주입하는 속성으로 인한 SSR/CSR 불일치 회피를 위해
// 해당 페이지를 클라이언트 전용으로 렌더링합니다.
const ClientOnlyAuthTest = dynamic(async () => ({ default: AuthTestInner }), {
  ssr: false,
});

export default function AuthTestPage() {
  return <ClientOnlyAuthTest />;
}
