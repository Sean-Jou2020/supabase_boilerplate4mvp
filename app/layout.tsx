import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import "./globals.css";

// ClerkProvider를 동적으로 import하여 빌드 시점 초기화 방지
const ClerkProvider = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.ClerkProvider),
  {
    ssr: false,
    loading: () => null,
  },
);

const SyncUserProvider = dynamic(
  () =>
    import("@/components/providers/sync-user-provider").then(
      (mod) => mod.SyncUserProvider,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS 템플릿",
  description: "Next.js + Clerk + Supabase 보일러플레이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 개발 환경에서만 hydration 경고 억제
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={isDevelopment}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
