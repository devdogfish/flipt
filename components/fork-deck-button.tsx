"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { forkDeck } from "@/app/actions"

export function ForkDeckButton({ deckId }: { deckId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      disabled={isPending}
      onClick={() => startTransition(() => forkDeck(deckId))}
    >
      <Copy className="w-4 h-4" />
      {isPending ? "Copying…" : "Copy to my decks"}
    </Button>
  )
}
