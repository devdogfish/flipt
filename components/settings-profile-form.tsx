"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateDisplayName } from "@/app/actions"

export function SettingsProfileForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await updateDisplayName(name)
        setSaved(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-1.5">
        <Label htmlFor="display-name">Display name</Label>
        <Input
          id="display-name"
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false) }}
          placeholder="Your name"
          required
        />
      </div>

      <Button type="submit" disabled={isPending || name === currentName}>
        {isPending ? "Saving…" : saved ? "Saved" : "Save"}
      </Button>
    </form>
  )
}
