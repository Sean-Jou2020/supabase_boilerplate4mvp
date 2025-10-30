"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { createSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LuFile, LuTriangleAlert } from "react-icons/lu";
import Link from "next/link";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";

function StorageTestInner() {
  const supabase = createSupabaseClient();
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Storage 버킷 존재 여부 확인 (서버 라우트 사용)
  const checkBucket = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 서버 라우트로 관리자 권한 검사
      const resp = await fetch("/api/storage/check-bucket", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const contentType = resp.headers.get("content-type") || "";
      const body = contentType.includes("application/json")
        ? await resp.json()
        : { ok: false, error: await resp.text() };

      if (!resp.ok || !body.ok) {
        const message =
          typeof body === "object" && body && "error" in body
            ? (body as any).error
            : "버킷 확인 실패";
        throw new Error(
          typeof message === "string" ? message : "버킷 확인 실패",
        );
      }

      const exists = Boolean((body as any).exists);
      setBucketExists(exists);

      if (!exists) {
        setError(
          `'${STORAGE_BUCKET}' 버킷이 존재하지 않습니다. Supabase Dashboard에서 생성해주세요.`,
        );
      } else {
        setError(null); // 성공 시 에러 초기화
      }
    } catch (err) {
      setBucketExists(false);
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 에러";
      setError(errorMessage);
      console.error("Check bucket error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 페이지 로드 시 자동 확인
  useEffect(() => {
    checkBucket();
  }, [checkBucket]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← 홈으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold mb-2">
          Supabase Storage 연결 테스트
        </h1>
        <p className="text-gray-600">
          Supabase Storage 버킷 연결 상태를 테스트합니다.
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
              1. Supabase Dashboard에서 Storage 메뉴로 이동
              <br />
              2. "Create bucket" 버튼 클릭
              <br />
              3. 버킷 이름으로 "uploads" 입력 후 생성
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

      {/* 버킷 상태 */}
      <div className="mb-8 p-6 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Storage 버킷 상태</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={checkBucket}
            disabled={loading}
          >
            {loading ? "확인 중..." : "다시 확인"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {bucketExists === null && loading && (
            <>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-600">버킷 확인 중...</span>
            </>
          )}
          {bucketExists === true && (
            <>
              <LuFile className="w-6 h-6 text-green-600" />
              <span className="text-green-600 font-semibold">
                버킷 연결 성공!
              </span>
            </>
          )}
          {bucketExists === false && (
            <>
              <LuTriangleAlert className="w-6 h-6 text-red-600" />
              <span className="text-red-600 font-semibold">버킷 없음</span>
            </>
          )}
        </div>
      </div>

      {/* 환경 변수 정보 */}
      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <LuFile className="w-6 h-6" />
          환경 변수 설정 상태
        </h2>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="font-semibold min-w-[200px]">STORAGE_BUCKET:</span>
            <span
              className={STORAGE_BUCKET ? "text-green-600" : "text-red-600"}
            >
              {STORAGE_BUCKET ? `✅ ${STORAGE_BUCKET}` : "❌ 설정되지 않음"}
            </span>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold mb-2">💡 이 페이지의 작동 원리</h3>
        <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
          <li>Supabase Storage 버킷의 존재 여부를 확인합니다</li>
          <li>환경 변수가 올바르게 설정되었는지 검증합니다</li>
          <li>Storage 연결 상태를 실시간으로 모니터링합니다</li>
          <li>현재 Clerk 통합 없이 Supabase Storage만 테스트합니다</li>
        </ul>
      </div>
    </div>
  );
}

// 브라우저 확장프로그램이 주입하는 속성으로 인한 SSR/CSR 불일치 회피를 위해
// 해당 페이지를 클라이언트 전용으로 렌더링합니다.
const ClientOnlyStorageTest = dynamic(
  async () => ({ default: StorageTestInner }),
  {
    ssr: false,
  },
);

export default function StorageTestPage() {
  return <ClientOnlyStorageTest />;
}
