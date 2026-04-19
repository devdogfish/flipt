import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/components/page-layout";
import { CollectionGrid } from "@/components/collection-grid";
import type { CollectionGridData } from "@/components/collection-grid";

export const metadata: Metadata = {
  title: "My Collections — flashcardbrowser",
  description: "Manage your personal flashcard collections.",
};

export default async function CollectionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const collectionsRaw = await prisma.collection.findMany({
    where: { userId: session!.user.id, courseCode: null },
    include: { _count: { select: { decks: true } } },
    orderBy: { createdAt: "asc" },
  });

  const collections: CollectionGridData[] = collectionsRaw.map((c) => ({
    id: c.id,
    name: c.name,
    deckCount: c._count.decks,
  }));

  return (
    <PageLayout
      title="My Collections"
      subtitle="Group your decks into personal collections"
      maxWidth="max-w-4xl"
    >
      <CollectionGrid collections={collections} />
    </PageLayout>
  );
}
