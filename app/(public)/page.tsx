import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HeroSection } from "@/components/landing/hero-section";
import { UspSection } from "@/components/landing/usp-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { DeckGrid } from "@/components/landing/deck-grid";
import { CtaSection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "flashcardbrowser — Spaced repetition for Dalhousie students",
  description:
    "Pre-built course decks for Dal students. FSRS schedules exactly when to review each card. Or paste your notes and get flashcards in seconds.",
};

export default async function LandingPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  const featuredDecks = await prisma.deck.findMany({
    where: { visibility: "PUBLIC" },
    include: {
      _count: { select: { cards: true } },
      owner: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <main className="min-h-svh">
      <HeroSection session={!!session} />
      <UspSection />
      <FeaturesSection />
      <DeckGrid decks={featuredDecks} />

      {!session && <CtaSection />}

      {/* Footer */}
      <footer className="px-5 py-8 border-t border-border">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          flashcardbrowser
          <div className="flex items-center gap-4">
            <Link
              href="/tips"
              className="hover:text-foreground transition-colors"
            >
              Tips
            </Link>
            <Link
              href="/decks"
              className="hover:text-foreground transition-colors"
            >
              Browse decks
            </Link>
            {!session && (
              <Link
                href="/auth/sign-in"
                className="hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
