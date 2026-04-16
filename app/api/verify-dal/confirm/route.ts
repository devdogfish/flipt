import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-dal?error=invalid", request.url));
  }

  const record = await prisma.dalVerification.findUnique({
    where: { token },
    include: { user: { select: { id: true } } },
  });

  if (!record) {
    return NextResponse.redirect(new URL("/verify-dal?error=invalid", request.url));
  }

  if (record.expiresAt < new Date()) {
    await prisma.dalVerification.delete({ where: { token } });
    return NextResponse.redirect(new URL("/verify-dal?error=expired", request.url));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { dalEmail: record.dalEmail },
    }),
    prisma.dalVerification.delete({ where: { token } }),
  ]);

  return NextResponse.redirect(new URL("/", request.url));
}
