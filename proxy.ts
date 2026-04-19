import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Always passthrough — never redirect, never check session
const ALWAYS_PASSTHROUGH_PREFIXES = [
  "/onboarding",
  "/api/auth",
  "/api/verify-dal",
  "/_next",
  "/favicon",
  "/manifest",
];

// Routes that unauthenticated visitors can access freely
const UNAUTHED_PUBLIC_PREFIXES = ["/auth", "/api/decks", "/api/collections"];
const UNAUTHED_PUBLIC_PATHS = ["/", "/tips", "/docs"];
const UNAUTHED_PUBLIC_BROWSEABLE = ["/decks", "/public"];

function isPassthrough(pathname: string): boolean {
  return ALWAYS_PASSTHROUGH_PREFIXES.some((p) => pathname.startsWith(p));
}

function isUnauthedPublic(pathname: string): boolean {
  return (
    UNAUTHED_PUBLIC_PATHS.includes(pathname) ||
    UNAUTHED_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    UNAUTHED_PUBLIC_BROWSEABLE.some((p) => pathname.startsWith(p))
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const httpMethod = request.method;

  // Always let these through with no checks
  if (isPassthrough(pathname)) return NextResponse.next();

  // For large POST/PUT (server actions with file uploads), skip body reads.
  // Auth is enforced inside the server action itself.
  if (httpMethod === "POST" || httpMethod === "PUT") {
    const hasCookie =
      request.cookies.has("better-auth.session_token") ||
      request.cookies.has("__Secure-better-auth.session_token");
    if (!hasCookie) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });

  // ── Authenticated users ───────────────────────────────────────────────────
  if (session) {
    const user = (session as any).user as {
      id: string;
      email: string;
      emailVerified: boolean;
      dalEmail?: string | null;
      fieldOfStudy?: string | null;
    };

    // Dev bypass — seed accounts don't have real Dal emails
    const isSeedUser =
      process.env.NODE_ENV === "development" &&
      (user.email.endsWith("@flashcardbrowser.app") ||
        user.email.endsWith("@flashcardbrowser.com"));

    if (!isSeedUser) {
      // Lazy auto-populate: @dal.ca signup that verified email before the hook existed
      if (!user.dalEmail && user.email.endsWith("@dal.ca") && user.emailVerified) {
        const { prisma } = await import("@/lib/db");
        await prisma.user.update({
          where: { id: user.id },
          data: { dalEmail: user.email },
        });
        // dalEmail is now set — fall through as onboarding complete
      } else if (!user.dalEmail || !user.fieldOfStudy) {
        // Incomplete onboarding — block ALL pages until done
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }

    // Onboarding complete — redirect away from /auth pages
    if (pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // ── Unauthenticated users ─────────────────────────────────────────────────
  if (isUnauthedPublic(pathname)) return NextResponse.next();

  return NextResponse.redirect(new URL("/auth/sign-in", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.mp3|.*\\.webp).*)",
  ],
};
