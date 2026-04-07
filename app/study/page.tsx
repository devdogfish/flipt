import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { StudyPage } from "@/components/study-page"
import { computeFamiliarity, isDue } from "@/lib/spaced-repetition"

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

  // Fetch usage for these cards to compute familiarity
  const cardIds = rawCards.map((c) => c.id)
  const usages = await prisma.flashcardUsage.findMany({
    where: { userId: session.user.id, cardId: { in: cardIds } },
    orderBy: { reviewedAt: "desc" },
    select: { cardId: true, result: true, reviewedAt: true },
  })

  // Group usages by cardId (already ordered desc)
  const usageByCard = new Map<string, typeof usages>()
  for (const u of usages) {
    const arr = usageByCard.get(u.cardId)
    if (arr) arr.push(u)
    else usageByCard.set(u.cardId, [u])
  }

  // Annotate each card with familiarity and due status
  const cards = rawCards
    .map((card) => {
      const cardUsages = usageByCard.get(card.id) ?? []
      const familiarity = computeFamiliarity(cardUsages)
      const due = isDue(familiarity, cardUsages[0]?.reviewedAt ?? null)
      return { ...card, familiarity, due }
    })
    // Sort: due cards first (least familiar first), then non-due by familiarity
    .sort((a, b) => {
      if (a.due !== b.due) return a.due ? -1 : 1
      return a.familiarity - b.familiarity
    })

  const deckTitle =
    decks.length === 1 ? decks[0].title : `${decks.length} decks`

  return (
    <StudyPage
      userName={session.user.name ?? ""}
      userEmail={session.user.email}
      userImage={session.user.image}
      cards={cards}
      deckTitle={deckTitle}
    />
  )
}
