import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/components/page-layout";
import { BasketDeckView } from "@/components/basket-deck-view";
import type { BasketDeckData } from "@/components/basket-deck-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session) return { title: "Collection — flashcardbrowser" };

  const collection = await prisma.collection.findFirst({
    where: { id, userId: session.user.id, courseCode: null },
  });
  if (!collection) return { title: "Collection — flashcardbrowser" };
  return { title: `${collection.name} — flashcardbrowser` };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const [collection, collectionDecks, favorites] = await Promise.all([
    prisma.collection.findFirst({
      where: { id, userId: session!.user.id, courseCode: null },
      include: { _count: { select: { decks: true } } },
    }),
    prisma.collectionDeck.findMany({
      where: { collectionId: id },
      include: {
        deck: {
          include: {
            _count: { select: { cards: true } },
            owner: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.deckFavorite.findMany({
      where: { userId: session!.user.id },
      select: { deckId: true },
    }),
  ]);

  if (!collection) notFound();

  const decks: BasketDeckData[] = collectionDecks.map((cd) => ({
    id: cd.deck.id,
    title: cd.deck.title,
    description: cd.deck.description ?? "",
    cardCount: cd.deck._count.cards,
    coverImage: cd.deck.coverImage ?? null,
    ownerName: cd.deck.owner?.name ?? null,
    isOwned: cd.deck.owner?.id === session!.user.id,
    createdAt: cd.deck.createdAt.toISOString(),
  }));

  return (
    <PageLayout
      title={collection.name}
      backHref="/collections"
      backLabel="My Collections"
      subtitle={`${collection._count.decks} ${collection._count.decks === 1 ? "deck" : "decks"} · Your collection`}
      maxWidth="max-w-4xl"
    >
      <BasketDeckView
        decks={decks}
        favoriteIds={favorites.map((f) => f.deckId)}
        isAuthenticated={true}
      />
    </PageLayout>
  );
}
