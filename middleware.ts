import { NextRequest, NextResponse } from "next/server";

// Routes that never require auth or Dal verification
const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-dal",
  "/api/auth",
  "/api/verify-dal",
  "/_next",
  "/favicon",
  "/manifest",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  // Auth temporarily disabled during development — re-enable by removing this line
  return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) return NextResponse.next();

  // Get session via better-auth cookie helper (no DB hit)
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const user = session.user as typeof session.user & { dalEmail?: string | null };

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

  if (!user.dalEmail) {
    return NextResponse.redirect(new URL("/verify-dal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.mp3|.*\\.webp).*)",
  ],
};
