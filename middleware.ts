import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  // 여기에 보호할 라우트를 추가하세요
  // 예: "/dashboard(.*)", "/profile(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  // 보호된 라우트에 대해서만 인증 요구
  if (isProtectedRoute(req)) {
    const session = await auth();
    session.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
