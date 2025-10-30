import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  experimental: {
    // not-found 페이지를 static export에서 제외하여 Clerk 초기화 에러 방지
    serverComponentsExternalPackages: [],
  },
  // not-found 페이지를 빌드 시점에 prerender하지 않음
  generateBuildId: async () => {
    return "build-" + Date.now();
  },
};

export default nextConfig;
