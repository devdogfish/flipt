import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { StudyPage } from "@/components/study-page"

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  // Auth temporarily disabled — skip redirect
  // if (!session) redirect("/sign-in")

  const deck = await prisma.deck.findFirst({
    where: { visibility: "PUBLIC" },
    orderBy: { createdAt: "asc" },
    include: {
      cards: { orderBy: { position: "asc" } },
    },
  })

  const cards = (deck?.cards ?? []).map((card) => ({
    id: card.id,
    question: card.question,
    answer: card.answer,
    image: card.imageUrl ?? undefined,
    stability: null,
    difficulty: null,
    nextDue: null,
    reviewCount: 0,
    lastReviewedAt: null,
  }))

  return (
    <StudyPage
      cards={cards}
      deckTitle={deck?.title}
    />
  )
}
