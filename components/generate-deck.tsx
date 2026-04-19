"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoverImageUpload } from "@/components/cover-image-upload";
import { DocumentUpload, type FileList } from "@/components/document-upload";
import { GenerateDeckCardList } from "@/components/generate-deck-card-list";
import { generateFlashcardsFromDocument, saveDeckFromGeneration } from "@/app/actions";
import type { GeneratedCard } from "@/components/generate-deck-card-row";

type Stage = "upload" | "generating" | "review";

let idCounter = 0;
function uid() {
  return `card-${++idCounter}`;
}

const EMPTY_FILES: FileList = { docs: [], images: [] };

export function GenerateDeck() {
  const [stage, setStage] = useState<Stage>("upload");
  const [files, setFiles] = useState<FileList>(EMPTY_FILES);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Review state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [cards, setCards] = useState<GeneratedCard[]>([]);

  const [, startGenerate] = useTransition();
  const [isSaving, startSave] = useTransition();

  const totalFiles = files.docs.length + files.images.length;

  async function handleGenerate() {
    if (totalFiles === 0) return;
    setGenerateError(null);
    setStage("generating");

    startGenerate(async () => {
      try {
        const form = new FormData();
        for (const f of [...files.docs, ...files.images]) {
          form.append("file", f);
        }
        const result = await generateFlashcardsFromDocument(form);
        setTitle(result.deckTitle);
        setDescription(result.deckDescription);
        setCards(result.cards.map((c) => ({ id: uid(), ...c })));
        setStage("review");
      } catch (err) {
        setGenerateError(err instanceof Error ? err.message : "Generation failed. Please try again.");
        setStage("upload");
      }
    });
  }

  function handleRegenerate() {
    setStage("upload");
    setCards([]);
    setCoverImage(null);
  }

  function handleUpdateCard(id: string, question: string, answer: string) {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, question, answer } : c)),
    );
  }

  function handleDeleteCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSave() {
    startSave(async () => {
      try {
        await saveDeckFromGeneration({
          title,
          description,
          coverImage,
          visibility,
          cards: cards.map(({ question, answer }) => ({ question, answer })),
        });
      } catch (err) {
        setGenerateError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {stage === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <DocumentUpload
              files={files}
              onChange={setFiles}
              error={generateError}
            />

            <Button
              type="button"
              onClick={handleGenerate}
              disabled={totalFiles === 0}
              className="w-full gap-2"
            >
              <Sparkles size={15} />
              Generate flashcards
            </Button>
          </motion.div>
        )}

        {stage === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-16 gap-4 text-center"
          >
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Generating flashcards...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reading your {totalFiles > 1 ? `${totalFiles} files` : "document"} and creating cards. This takes 10–30 seconds.
              </p>
            </div>
          </motion.div>
        )}

        {stage === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="gen-title">Title</Label>
              <Input
                id="gen-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deck title"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gen-description">Description</Label>
              <Textarea
                id="gen-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What is this deck about?"
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
              <CoverImageUpload
                value={coverImage}
                onChange={setCoverImage}
                deckTitle={title}
                deckDescription={description}
              />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-3">
                {cards.length} card{cards.length !== 1 ? "s" : ""} generated
              </p>
              <GenerateDeckCardList
                cards={cards}
                onUpdate={handleUpdateCard}
                onDelete={handleDeleteCard}
              />
            </div>

            {generateError && (
              <p className="text-xs text-destructive">{generateError}</p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleRegenerate}
                disabled={isSaving}
              >
                Regenerate
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !title.trim() || cards.length === 0}
                className="flex-1"
              >
                {isSaving ? "Saving…" : "Save deck"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
