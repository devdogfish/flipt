import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Routes that never require auth or Dal verification
const PUBLIC_PREFIXES = [
  "/auth",
  "/onboarding",
  "/api/auth",
  "/api/verify-dal",
  "/api/decks",
  "/api/collections",
  "/_next",
  "/favicon",
  "/manifest",
];

// Exact-match public paths (and their sub-paths via prefix in PUBLIC_PREFIXES)
const PUBLIC_PATHS = ["/", "/tips", "/docs"];

// Prefix-based public routes (browseable without auth)
const PUBLIC_BROWSEABLE = ["/decks", "/public"];

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PUBLIC_BROWSEABLE.some((prefix) => pathname.startsWith(prefix))
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, method } = request.nextUrl as unknown as { pathname: string; method: string };
  const httpMethod = request.method;

  // For large POST/PUT requests (e.g. server actions with file uploads),
  // skip the body entirely — auth is checked via cookies in the server action itself.
  // We still enforce auth for GET requests via the session check below.
  if ((httpMethod === "POST" || httpMethod === "PUT") && !isPublicRoute(pathname)) {
    const hasCookie = request.cookies.has("better-auth.session_token") ||
      request.cookies.has("__Secure-better-auth.session_token");
    if (!hasCookie) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    // Redirect authenticated users away from /auth/* pages
    if (pathname.startsWith("/auth")) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (session) return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Get session via better-auth cookie helper (no DB hit)
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (session as any).user as { dalEmail?: string | null; fieldOfStudy?: string | null; email: string; emailVerified: boolean; id: string };

  // Dev bypass — seed users don't have real Dal emails
  if (process.env.NODE_ENV === "development" && !user.dalEmail) {
    // Auto-populate for @dal.ca accounts that have verified their email
    if (user.email.endsWith("@dal.ca") && user.emailVerified) {
      return NextResponse.next();
    }
    // Allow dev seed users through
    if (
      user.email.endsWith("@flashcardbrowser.app") ||
      user.email.endsWith("@flashcardbrowser.com")
    ) {
      return NextResponse.next();
    }
  }

  // Lazy auto-populate: @dal.ca account with verified email but dalEmail not set yet
  if (!user.dalEmail && user.email.endsWith("@dal.ca") && user.emailVerified) {
    // Fire-and-forget update — user proceeds without interruption
    const { prisma } = await import("@/lib/db");
    await prisma.user.update({
      where: { id: user.id },
      data: { dalEmail: user.email },
    });
    return NextResponse.next();
  }

  if (!user.dalEmail || !user.fieldOfStudy) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.mp3|.*\\.webp).*)",
  ],
};
