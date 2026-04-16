import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { BookOpen, Globe, Zap } from "lucide-react";
import { cardGradient } from "@/lib/deck-gradient";

export const metadata: Metadata = {
  title: "flashcardbrowser — Spaced repetition for Dalhousie students",
  description:
    "Study smarter with flashcardbrowser. Free spaced repetition flashcards built for Dal students — community decks, FSRS algorithm, zero friction.",
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
      {/* Hero */}
      <section className="px-5 pt-24 pb-20 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-8">
          <Zap className="w-3 h-3" />
          Free for Dal students
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-5">
          Study smarter,{" "}
          <span className="font-serif italic text-primary">not harder</span>
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto">
          Flashcard-based spaced repetition built for Dalhousie. Browse community
          decks, build your own, and let the FSRS algorithm schedule exactly what
          you need to review.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {session ? (
            <Link href="/decks">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Go to my decks
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Get started — it&apos;s free
                </Button>
              </Link>
              <Link href="/decks">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  Browse decks
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="px-5 py-16 bg-muted/40 border-y border-border">
        <div className="max-w-2xl mx-auto grid sm:grid-cols-3 gap-8">
          {[
            {
              icon: <BookOpen className="w-5 h-5" />,
              title: "FSRS spaced repetition",
              desc: "The most effective memory algorithm schedules cards at exactly the right moment.",
            },
            {
              icon: <Globe className="w-5 h-5" />,
              title: "Community decks",
              desc: "Browse and copy public decks from other Dal students. No reinventing the wheel.",
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: "Zero friction",
              desc: "Sign in with your Microsoft account, pick a deck, and start studying in seconds.",
            },
          ].map((f) => (
            <div key={f.title} className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured decks */}
      {featuredDecks.length > 0 && (
        <section className="px-5 py-16 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold tracking-tight">
              Community decks
            </h2>
            <Link
              href="/decks"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {featuredDecks.map((deck) => {
              const gradient = cardGradient(deck.id);
              return (
                <Link key={deck.id} href={`/decks/${deck.id}`}>
                  <div className="group relative aspect-[3/2] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {deck.coverImage ? (
                      <Image
                        src={deck.coverImage}
                        alt={deck.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-linear-to-br ${gradient}`}
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-semibold leading-tight truncate">
                        {deck.title}
                      </p>
                      <p className="text-white/60 text-[10px] mt-0.5">
                        {deck._count.cards} cards
                        {deck.owner?.name ? ` · ${deck.owner.name}` : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Sign-up CTA — only for visitors */}
      {!session && (
        <section className="px-5 py-20 text-center border-t border-border">
          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            Ready to actually remember things?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
            Sign in with your Dalhousie Microsoft account — takes about 30 seconds.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="px-10">
              Create free account
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
          </p>
        </section>
      )}
    </main>
  );
}
