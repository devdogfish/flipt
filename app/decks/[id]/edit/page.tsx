import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DeckMetadataForm } from "@/components/deck-metadata-form"
import { CardListEditor } from "@/components/card-list-editor"
import { DeleteDeckButton } from "@/components/delete-deck-button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"

export default async function EditDeckPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const { id } = await params

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: { cards: { orderBy: { position: "asc" } } },
  })

  if (!deck) notFound()
  if (deck.ownerId !== session.user.id) notFound()

  return (
    <main className="min-h-svh px-5 py-16 pb-24">
      <div className="max-w-lg mx-auto">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Back to decks
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Edit deck</h1>
          <p className="text-sm text-muted-foreground">{deck.title}</p>
        </div>

        {/* Deck metadata */}
        <section className="mb-10">
          <DeckMetadataForm
            mode="edit"
            deckId={deck.id}
            defaultValues={{
              title: deck.title,
              description: deck.description ?? "",
              visibility: deck.visibility,
              coverImage: deck.coverImage,
            }}
          />
        </section>

        <Separator className="my-8" />

        {/* Cards */}
        <section className="mb-10">
          <h2 className="text-base font-semibold mb-1">Cards</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}
          </p>
          <CardListEditor
            deckId={deck.id}
            initialCards={deck.cards.map((c) => ({
              id: c.id,
              question: c.question,
              answer: c.answer,
              imageUrl: c.imageUrl,
              position: c.position,
            }))}
          />
        </section>

        <Separator className="my-8" />

        {/* Danger zone */}
        <section>
          <h2 className="text-base font-semibold mb-1">Danger zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete this deck and all its cards.
          </p>
          <DeleteDeckButton deckId={deck.id} deckTitle={deck.title} />
        </section>
      </div>
    </main>
  )
}
