import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Globe,
  Lock,
  Pencil,
  BookOpen,
  Download,
} from "lucide-react";
import { computeStreak } from "@/lib/spaced-repetition";
import { ForkDeckButton } from "@/components/fork-deck-button";
import { ShareDeckButton } from "@/components/share-deck-button";
import { cardGradient } from "@/lib/deck-gradient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const deck = await prisma.deck.findUnique({
    where: { id },
    select: { title: true, description: true, coverImage: true, visibility: true },
  });

  if (!deck || deck.visibility !== "PUBLIC") {
    return { title: "Deck — flashcardbrowser" };
  }

  return {
    title: `${deck.title} — flashcardbrowser`,
    description:
      deck.description ??
      `Study "${deck.title}" on flashcardbrowser — free spaced repetition for Dal students.`,
    openGraph: {
      title: deck.title,
      description:
        deck.description ??
        `Study "${deck.title}" with spaced repetition on flashcardbrowser.`,
      ...(deck.coverImage ? { images: [{ url: deck.coverImage }] } : {}),
    },
  };
}

export default async function DeckDetailPage({ params }: Props) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  const { id } = await params;

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      cards: { orderBy: { position: "asc" } },
      owner: { select: { name: true } },
      shares: session ? { where: { userId: session.user.id } } : false,
    },
  });

  if (!deck) notFound();

  // Access control for private decks
  if (deck.visibility === "PRIVATE") {
    if (!session) redirect("/sign-in");
    const isOwner = deck.ownerId === session.user.id;
    const isShared = (deck.shares as { userId: string }[] | false) !== false &&
      (deck.shares as { userId: string }[]).length > 0;
    if (!isOwner && !isShared) notFound();
  }

  const isOwner = session?.user.id === deck.ownerId;
  const isAuthenticated = !!session;

  // FSRS stats for logged-in users
  let masteredCount = 0;
  let dueCount = 0;
  let totalReviews = 0;
  let streak = 0;

  if (session && deck.cards.length > 0) {
    const cardIds = deck.cards.map((c) => c.id);
    const now = new Date();

    const [schedules, usages] = await Promise.all([
      prisma.cardSchedule.findMany({
        where: { userId: session.user.id, cardId: { in: cardIds } },
        select: { stability: true, nextDue: true },
      }),
      prisma.flashcardUsage.findMany({
        where: { userId: session.user.id, cardId: { in: cardIds } },
        orderBy: { reviewedAt: "desc" },
        select: { reviewedAt: true },
      }),
    ]);

    masteredCount = schedules.filter((s) => s.stability >= 21).length;
    dueCount = schedules.filter((s) => s.nextDue <= now).length;
    totalReviews = usages.length;
    streak = computeStreak(usages);
  }

  // "More decks" for non-auth users (same owner or recent public)
  const moreDecksList =
    !isAuthenticated && deck.visibility === "PUBLIC"
      ? await prisma.deck.findMany({
          where: {
            visibility: "PUBLIC",
            id: { not: deck.id },
            OR: [
              { ownerId: deck.ownerId },
              { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            ],
          },
          include: {
            _count: { select: { cards: true } },
            owner: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 4,
        })
      : [];

  // Cards shown: all for non-auth public decks, all for auth users
  const displayCards = deck.cards;

  return (
    <main className="min-h-svh px-5 py-16">
      <div className="max-w-lg mx-auto">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          {isAuthenticated ? "Back to decks" : "Browse decks"}
        </Link>

        {deck.coverImage && (
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <Image
              src={deck.coverImage}
              alt={deck.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">{deck.title}</h1>
            {isOwner && (
              <div className="flex items-center gap-2 shrink-0">
                <a href={`/api/decks/${deck.id}/export`} download>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </Button>
                </a>
                <Link href={`/decks/${deck.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              {deck.visibility === "PUBLIC" ? (
                <Globe className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              {deck.visibility === "PUBLIC" ? "Public" : "Private"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}
            </span>
            {deck.owner?.name && !isOwner && (
              <span className="text-sm text-muted-foreground">
                by {deck.owner.name}
              </span>
            )}
          </div>

          {deck.description && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {deck.description}
            </p>
          )}
        </div>

        {/* Stats (only shown to authenticated users with review history) */}
        {isAuthenticated && deck.cards.length > 0 && totalReviews > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6 rounded-xl border border-border bg-card p-4">
            <div className="text-center">
              <p className="text-xl font-semibold tabular-nums">
                {deck.cards.length > 0
                  ? Math.round((masteredCount / deck.cards.length) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Mastered</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold tabular-nums">{dueCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Due</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold tabular-nums">{totalReviews}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold tabular-nums">{streak}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Streak</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {deck.cards.length > 0 && (
          <div className="flex flex-col gap-3 mb-8">
            {isAuthenticated ? (
              <>
                <Link href={`/study?decks=${deck.id}`}>
                  <Button className="w-full gap-2">
                    <BookOpen className="w-4 h-4" />
                    {dueCount > 0 ? `Study (${dueCount} due)` : "Study this deck"}
                  </Button>
                </Link>
                {!isOwner && deck.visibility === "PUBLIC" && (
                  <ForkDeckButton deckId={deck.id} />
                )}
                {isOwner && deck.visibility === "PRIVATE" && (
                  <ShareDeckButton deckId={deck.id} deckTitle={deck.title} />
                )}
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button className="w-full gap-2">
                    <BookOpen className="w-4 h-4" />
                    Sign up to study with spaced repetition
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Card list */}
        {displayCards.length > 0 && (
          <>
            <Separator className="mb-6" />
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
                {isAuthenticated ? "Cards" : "Preview"}
              </h2>
              <div className="space-y-3">
                {displayCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-1"
                  >
                    <p className="text-sm font-medium">{card.question}</p>
                    <p className="text-sm text-muted-foreground">{card.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sign-up CTA for non-auth users after card list */}
        {!isAuthenticated && deck.visibility === "PUBLIC" && deck.cards.length > 0 && (
          <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center space-y-4">
            <div>
              <p className="font-semibold">Want to actually remember these?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sign up to study with the FSRS spaced repetition algorithm —
                it schedules reviews so you forget as little as possible.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/sign-up">
                <Button className="w-full sm:w-auto">Track my progress</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* More decks section (non-auth only) */}
        {moreDecksList.length > 0 && (
          <div className="mt-12">
            <Separator className="mb-8" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-5">
              More decks you might like
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {moreDecksList.map((d) => {
                const gradient = cardGradient(d.id);
                return (
                  <Link key={d.id} href={`/decks/${d.id}`}>
                    <div className="group relative aspect-[3/2] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {d.coverImage ? (
                        <Image
                          src={d.coverImage}
                          alt={d.title}
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
                          {d.title}
                        </p>
                        <p className="text-white/60 text-[10px] mt-0.5">
                          {d._count.cards} cards
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 text-center">
              <Link
                href="/decks"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Browse all decks
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
