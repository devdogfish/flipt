import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Globe, Lock, Pencil, BookOpen, Copy, Download } from "lucide-react"
import { computeFamiliarity, isDue, computeStreak } from "@/lib/spaced-repetition"
import { ForkDeckButton } from "@/components/fork-deck-button"

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)

  const { id } = await params

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      cards: { orderBy: { position: "asc" } },
      owner: { select: { name: true } },
    },
  })

  if (!deck) notFound()

  // Private decks require auth and ownership
  if (deck.visibility === "PRIVATE") {
    if (!session) redirect("/sign-in")
    if (deck.ownerId !== session.user.id) notFound()
  }

  const isOwner = session?.user.id === deck.ownerId
  const isAuthenticated = !!session

  // Fetch usage data for stats (only for logged-in users)
  let cardStats: { familiarity: number; due: boolean }[] = []
  let totalReviews = 0
  let streak = 0

  if (session && deck.cards.length > 0) {
    const cardIds = deck.cards.map((c) => c.id)
    const usages = await prisma.flashcardUsage.findMany({
      where: { userId: session.user.id, cardId: { in: cardIds } },
      orderBy: { reviewedAt: "desc" },
      select: { cardId: true, result: true, reviewedAt: true },
    })

    const usageByCard = new Map<string, typeof usages>()
    for (const u of usages) {
      const arr = usageByCard.get(u.cardId)
      if (arr) arr.push(u)
      else usageByCard.set(u.cardId, [u])
    }

    cardStats = deck.cards.map((card) => {
      const cardUsages = usageByCard.get(card.id) ?? []
      const familiarity = computeFamiliarity(cardUsages)
      const due = isDue(familiarity, cardUsages[0]?.reviewedAt ?? null)
      return { familiarity, due }
    })

    totalReviews = usages.length
    streak = computeStreak(usages)
  }

  const masteredCount = cardStats.filter((s) => s.familiarity >= 80).length
  const dueCount = cardStats.filter((s) => s.due).length
  const previewCards = deck.cards.slice(0, 5)

  return (
    <main className="min-h-svh px-5 py-16">
      <div className="max-w-lg mx-auto">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          {isAuthenticated ? "Back to decks" : "Back"}
        </Link>

        {deck.coverImage && (
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <Image src={deck.coverImage} alt={deck.title} fill className="object-cover" priority />
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
              <span className="text-sm text-muted-foreground">by {deck.owner.name}</span>
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
                {deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0}%
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
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button className="w-full gap-2">
                    <BookOpen className="w-4 h-4" />
                    Sign up to study
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

        {previewCards.length > 0 && (
          <>
            <Separator className="mb-6" />
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
                Preview
              </h2>
              <div className="space-y-3">
                {previewCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-1"
                  >
                    <p className="text-sm font-medium">{card.question}</p>
                    <p className="text-sm text-muted-foreground">{card.answer}</p>
                  </div>
                ))}
                {deck.cards.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{deck.cards.length - 5} more cards
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
