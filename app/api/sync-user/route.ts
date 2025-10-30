import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Clerk 사용자를 Supabase 데이터베이스에 동기화하는 API 라우트
 *
 * POST 요청으로 Clerk 사용자 정보를 받아 Supabase users 테이블에 저장합니다.
 * 이미 존재하는 사용자는 업데이트됩니다.
 */
export async function POST(request: NextRequest) {
  try {
    const { clerkId, name } = await request.json();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Clerk ID가 필요합니다" },
        { status: 400 },
      );
    }

    const supabase = createClerkSupabaseClient();

    // Clerk 사용자 정보를 Supabase에 upsert
    const { error } = await supabase.from("users").upsert(
      {
        clerk_id: clerkId,
        name: name || "Unknown User",
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "clerk_id",
        ignoreDuplicates: false,
      },
    );

    if (error) {
      console.error("Supabase sync error:", error);
      return NextResponse.json(
        { error: "사용자 동기화 실패", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "사용자가 성공적으로 동기화되었습니다",
    });
  } catch (error) {
    console.error("Sync user API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
