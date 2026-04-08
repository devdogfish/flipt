import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DeckSelection } from "@/components/deck-selection";
import { PageLayout } from "@/components/page-layout";
import { NewDeckButton } from "@/components/new-deck-button";

export default async function DecksPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const [userDecks, publicDecks, favorites] = await Promise.all([
    prisma.deck.findMany({
      where: { ownerId: session.user.id },
      include: { _count: { select: { cards: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.deck.findMany({
      where: { visibility: "PUBLIC", ownerId: { not: session.user.id } },
      include: {
        _count: { select: { cards: true } },
        owner: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.deckFavorite.findMany({
      where: { userId: session.user.id },
      select: { deckId: true },
    }),
  ]);

  const favoriteIds = new Set(favorites.map((f) => f.deckId));

  const toRow = (d: {
    id: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    createdAt: Date;
    visibility: string;
    _count: { cards: number };
    owner?: { name: string | null } | null;
  }) => ({
    id: d.id,
    title: d.title,
    description: d.description ?? "",
    cardCount: d._count.cards,
    coverImage: d.coverImage ?? null,
    ownerName: d.owner?.name ?? null,
    createdAt: d.createdAt.toISOString(),
    isPublic: d.visibility === "PUBLIC",
  });

  return (
    <PageLayout
      title="Choose your decks"
      subtitle="Pick from your collection or discover community decks"
      backHref="/"
      backLabel="Back"
    >
      <DeckSelection
        userDecks={userDecks.map(toRow)}
        publicDecks={publicDecks.map(toRow)}
        favoriteIds={[...favoriteIds]}
      />
    </PageLayout>
  );
}
