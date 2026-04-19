import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { NewDeckTabs } from "@/components/new-deck-tabs"

export default function NewDeckPage() {
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
            Create manually or generate from a document.
          </p>
        </div>

        <Suspense>
          <NewDeckTabs />
        </Suspense>
      </div>
    </main>
  )
}
