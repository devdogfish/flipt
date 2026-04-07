import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { DeckMetadataForm } from "@/components/deck-metadata-form"
import { ArrowLeft } from "lucide-react"

export default async function NewDeckPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  return (
    <main className="min-h-svh px-5 py-16">
      <div className="max-w-lg mx-auto">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Back to decks
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">New deck</h1>
          <p className="text-sm text-muted-foreground">
            Create a deck, then add cards on the next screen.
          </p>
        </div>

        <DeckMetadataForm mode="create" />
      </div>
    </main>
  )
}
