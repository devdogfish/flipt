import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { StudyPage } from "@/components/study-page"

export default async function StudyRoute({
  searchParams,
}: {
  searchParams: Promise<{ decks?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const { decks: decksParam } = await searchParams
  const deckIds = decksParam?.split(",").filter(Boolean) ?? []

  if (deckIds.length === 0) redirect("/decks")

  const decks = await prisma.deck.findMany({
    where: { id: { in: deckIds } },
    include: { cards: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "asc" },
  })

  const rawCards = decks.flatMap((deck) =>
    deck.cards.map((card) => ({
      id: card.id,
      question: card.question,
      answer: card.answer,
      image: card.imageUrl ?? undefined,
    })),
  )

  if (rawCards.length === 0) redirect("/decks")

  const cardIds = rawCards.map((c) => c.id)
  const schedules = await prisma.cardSchedule.findMany({
    where: { userId: session.user.id, cardId: { in: cardIds } },
    select: {
      cardId: true,
      stability: true,
      difficulty: true,
      nextDue: true,
      reviewCount: true,
      lastReviewedAt: true,
    },
  })

  const scheduleByCard = new Map(schedules.map((s) => [s.cardId, s]))
  const now = Date.now()

  const cards = rawCards
    .map((card) => {
      const s = scheduleByCard.get(card.id)
      return {
        ...card,
        stability: s?.stability ?? null,
        difficulty: s?.difficulty ?? null,
        nextDue: s?.nextDue.getTime() ?? null,
        reviewCount: s?.reviewCount ?? 0,
        lastReviewedAt: s?.lastReviewedAt?.getTime() ?? null,
      }
    })
    .sort((a, b) => {
      const aIsNew = a.nextDue === null
      const bIsNew = b.nextDue === null
      const aIsDue = !aIsNew && a.nextDue! <= now
      const bIsDue = !bIsNew && b.nextDue! <= now

      if (aIsDue !== bIsDue) return aIsDue ? -1 : 1
      if (aIsDue && bIsDue) return a.nextDue! - b.nextDue!
      if (aIsNew !== bIsNew) return aIsNew ? -1 : 1
      return (a.nextDue ?? 0) - (b.nextDue ?? 0)
    })

  const deckTitle = decks.length === 1 ? decks[0].title : `${decks.length} decks`

  return <StudyPage cards={cards} deckTitle={deckTitle} />
}
