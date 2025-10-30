import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header
      className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto"
      suppressHydrationWarning={true}
    >
      <Link href="/" className="text-2xl font-bold">
        SaaS Template
      </Link>
      <div className="flex gap-4 items-center" suppressHydrationWarning={true}>
        <Link href="/auth-test">
          <Button>인증 테스트</Button>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
