"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CoverImageUpload } from "@/components/cover-image-upload"
import { createDeck, updateDeck } from "@/app/actions"

interface DeckMetadataFormProps {
  mode: "create" | "edit"
  deckId?: string
  defaultValues?: {
    title: string
    description: string
    visibility: "PRIVATE" | "PUBLIC"
    coverImage: string | null
  }
}

export function DeckMetadataForm({ mode, deckId, defaultValues }: DeckMetadataFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "")
  const [description, setDescription] = useState(defaultValues?.description ?? "")
  const [visibility, setVisibility] = useState<"PRIVATE" | "PUBLIC">(
    defaultValues?.visibility ?? "PRIVATE",
  )
  const [coverImage, setCoverImage] = useState<string | null>(
    defaultValues?.coverImage ?? null,
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError("Title is required")
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createDeck(title, description, visibility, coverImage)
        } else if (deckId) {
          await updateDeck(deckId, title, description, visibility, coverImage)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. French Vocabulary"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this deck about?"
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Visibility</Label>
        <Select
          value={visibility}
          onValueChange={(v) => setVisibility(v as "PRIVATE" | "PUBLIC")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRIVATE">Private</SelectItem>
            <SelectItem value="PUBLIC">Public</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Cover Image</Label>
        <CoverImageUpload value={coverImage} onChange={setCoverImage} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending
          ? "Saving…"
          : mode === "create"
          ? "Create Deck"
          : "Save Changes"}
      </Button>
    </form>
  )
}
