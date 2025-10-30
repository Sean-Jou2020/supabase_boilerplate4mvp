import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect } from "react";

/**
 * Clerk 사용자를 Supabase 데이터베이스에 동기화하는 커스텀 훅
 *
 * 이 훅은 Clerk 인증 상태가 변경될 때마다 자동으로 사용자를
 * Supabase의 users 테이블에 동기화합니다.
 */
export function useSyncUser() {
  const { user, isLoaded } = useUser();

  const syncUser = useCallback(async () => {
    if (!user || !isLoaded) return;

    try {
      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          name: user.fullName || user.firstName || "Unknown User",
        }),
      });

      if (!response.ok) {
        console.error("Failed to sync user:", await response.text());
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  }, [user, isLoaded]);

  // 사용자 상태가 변경될 때마다 동기화
  useEffect(() => {
    if (isLoaded && user) {
      syncUser();
    }
  }, [user, isLoaded, syncUser]);
}
