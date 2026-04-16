import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DeckSelection } from "@/components/deck-selection";
import { PublicDecksBrowse } from "@/components/public-decks-browse";
import { PageLayout } from "@/components/page-layout";

export const metadata: Metadata = {
  title: "Browse Decks — flashcardbrowser",
  description:
    "Discover community flashcard decks for Dalhousie students. Browse, search, and study public decks across all subjects.",
};

export default async function DecksPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (session) {
    // Authenticated: show user's decks + shared decks + public decks
    const [userDecks, sharedDecks, publicDecks, favorites] = await Promise.all([
      prisma.deck.findMany({
        where: { ownerId: session.user.id },
        include: { _count: { select: { cards: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.deckShare.findMany({
        where: { userId: session.user.id },
        include: {
          deck: {
            include: {
              _count: { select: { cards: true } },
              owner: { select: { name: true } },
            },
          },
        },
      }),
      prisma.deck.findMany({
        where: {
          visibility: "PUBLIC",
          ownerId: { not: session.user.id },
          // Exclude decks already shared with this user
          NOT: {
            shares: { some: { userId: session.user.id } },
          },
        },
        include: {
          _count: { select: { cards: true } },
          owner: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
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

    const sharedRows = sharedDecks.map((s) => ({
      ...toRow({
        ...s.deck,
        visibility: s.deck.visibility,
      }),
      isShared: true,
    }));

    return (
      <PageLayout
        title="Your decks"
        subtitle="Your collection, shared decks, and community decks"
        maxWidth="max-w-4xl"
      >
        <DeckSelection
          userDecks={userDecks.map(toRow)}
          sharedDecks={sharedRows}
          publicDecks={publicDecks.map(toRow)}
          favoriteIds={[...favoriteIds]}
        />
      </PageLayout>
    );
  }

  // Not authenticated: public browse only
  const publicDecks = await prisma.deck.findMany({
    where: { visibility: "PUBLIC" },
    include: {
      _count: { select: { cards: true } },
      owner: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageLayout
      title="Community decks"
      subtitle="Browse public flashcard decks — sign in to create your own"
      maxWidth="max-w-4xl"
    >
      <PublicDecksBrowse
        decks={publicDecks.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description ?? "",
          cardCount: d._count.cards,
          coverImage: d.coverImage ?? null,
          ownerName: d.owner?.name ?? null,
          createdAt: d.createdAt.toISOString(),
        }))}
      />
    </PageLayout>
  );
}
