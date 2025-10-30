import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET() {
  try {
    const supabase = getServiceRoleClient();
    const bucketId = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";

    // storage API를 사용하여 버킷 존재 여부 확인 (서비스 롤 키 필요)
    const { data, error } = await supabase.storage.getBucket(bucketId);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, exists: Boolean(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
