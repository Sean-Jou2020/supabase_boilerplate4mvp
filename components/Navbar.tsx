"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  // Clerk 환경 변수 확인
  const hasClerkKeys = !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  );

  return (
    <header
      className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto"
      suppressHydrationWarning={true}
    >
      <Link href="/" className="text-2xl font-bold">
        SaaS Template
      </Link>
      <div className="flex gap-4 items-center" suppressHydrationWarning={true}>
        {hasClerkKeys ? (
          <>
            <SignedOut>
              <SignInButton mode="modal">
                <Button>로그인</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </>
        ) : (
          <Link href="/auth-test">
            <Button>인증 테스트</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
