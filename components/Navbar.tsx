"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { ShoppingCart } from "lucide-react";
import { getCartItemCount } from "@/actions/cart";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (isSignedIn) {
        try {
          const count = await getCartItemCount();
          setCartItemCount(count);
        } catch (error) {
          console.error("장바구니 품목 수 조회 실패:", error);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    fetchCartCount();
  }, [isSignedIn]);

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
            {cartItemCount > 0 && (
              <span
                className={cn(
                  "absolute -top-1 -right-1 flex items-center justify-center",
                  "min-w-[1.25rem] h-5 px-1.5 rounded-md",
                  "bg-primary text-primary-foreground text-xs font-semibold",
                  "shadow-sm",
                )}
              >
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
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
