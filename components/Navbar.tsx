"use client";

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { ShoppingCart } from "lucide-react";

const Navbar = () => {
  const { isSignedIn } = useUser();

  return (
    <header
      className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto"
      suppressHydrationWarning={true}
    >
      <Link href="/" className="text-2xl font-bold">
        OZ SHOP
      </Link>
      <div className="flex gap-4 items-center" suppressHydrationWarning={true}>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">장바구니</span>
          </Button>
        </Link>
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        )}
      </div>
    </header>
  );
};

export default Navbar;
