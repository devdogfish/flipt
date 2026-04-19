"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  FileJson,
  ArrowRight,
  AlertCircle,
  ImageIcon,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { importDeck, type ImportDeckData } from "@/app/actions";

// ── Format guide ─────────────────────────────────────────────────────────────

const FORMAT_EXAMPLE = `{
  "name": "My Deck",
  "description": "Optional description.",
  "coverImage": "https://example.com/cover.jpg",
  "cards": [
    {
      "id": "1",
      "front": {
        "title": "What is the powerhouse of the cell?",
        "description": "Optional extra context on the front."
      },
      "back": {
        "title": "The mitochondria",
        "description": "Optional explanation or detail.",
        "image": "https://example.com/mitochondria.jpg"
      }
    }
  ]
}`;

function FormatGuide() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(FORMAT_EXAMPLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
      >
        <span>View expected format</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border relative">
              <button
                type="button"
                onClick={copy}
                className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <pre className="px-4 py-4 text-xs font-mono leading-relaxed overflow-x-auto text-foreground/70 bg-muted/20">
                {FORMAT_EXAMPLE}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── JSON schema types ────────────────────────────────────────────────────────

interface JsonCard {
  front: { title: string; description?: string };
  back: { title: string; description?: string; image?: string };
}

interface JsonDeck {
  name: string;
  description?: string;
  coverImage?: string;
  cards: JsonCard[];
}

// ── Parser ───────────────────────────────────────────────────────────────────

function parseJson(raw: unknown): ImportDeckData {
  if (typeof raw !== "object" || raw === null)
    throw new Error("Invalid JSON: expected an object at the root");

  const obj = raw as Record<string, unknown>;

  if (typeof obj.name !== "string" || !obj.name.trim())
    throw new Error("Missing required field: name");

  if (!Array.isArray(obj.cards))
    throw new Error("Missing required field: cards (must be an array)");

  if (obj.cards.length === 0)
    throw new Error("Deck must contain at least one card");

  const cards = (obj.cards as unknown[]).map((card, i) => {
    if (typeof card !== "object" || card === null)
      throw new Error(`Card ${i + 1}: invalid format`);

    const c = card as Record<string, unknown>;
    const front = c.front as Record<string, unknown> | undefined;
    const back = c.back as Record<string, unknown> | undefined;

    if (!front || typeof front.title !== "string" || !front.title.trim())
      throw new Error(`Card ${i + 1}: missing front.title`);
    if (!back || typeof back.title !== "string" || !back.title.trim())
      throw new Error(`Card ${i + 1}: missing back.title`);

    const question =
      typeof front.description === "string" && front.description.trim()
        ? `${front.title}\n\n${front.description}`
        : front.title;

    const answer =
      typeof back.description === "string" && back.description.trim()
        ? `${back.title}\n\n${back.description}`
        : back.title;

    return {
      question: question as string,
      answer: answer as string,
      imageUrl:
        typeof back.image === "string" && back.image ? back.image : null,
    };
  });

  return {
    title: (obj.name as string).trim(),
    description:
      typeof obj.description === "string"
        ? obj.description.trim() || null
        : null,
    coverImage:
      typeof obj.coverImage === "string" && obj.coverImage
        ? obj.coverImage
        : null,
    cards,
  };
}

// ── Component ────────────────────────────────────────────────────────────────

type Step = "idle" | "preview" | "importing";
type IdleMode = "file" | "paste";

export function DeckImport() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [idleMode, setIdleMode] = useState<IdleMode>("file");
  const [parsed, setParsed] = useState<ImportDeckData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setError("Please upload a .json file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const deck = parseJson(raw);
        setParsed(deck);
        setError(null);
        setStep("preview");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so the same file can be re-selected after going back
      e.target.value = "";
    },
    [processFile],
  );

  const handleImport = useCallback(async () => {
    if (!parsed) return;
    setStep("importing");
    try {
      const { deckId } = await importDeck(parsed);
      router.push(`/decks/${deckId}/edit`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Import failed. Please try again.",
      );
      setStep("preview");
    }
  }, [parsed, router]);

  const processPaste = useCallback((text: string) => {
    try {
      const raw = JSON.parse(text);
      const deck = parseJson(raw);
      setParsed(deck);
      setError(null);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse JSON");
    }
  }, []);

  const reset = useCallback(() => {
    setStep("idle");
    setParsed(null);
    setError(null);
    setPasteText("");
  }, []);

  const imageCount = parsed?.cards.filter((c) => c.imageUrl).length ?? 0;

  return (
    <AnimatePresence mode="wait">
          {/* ── Idle: drop zone or paste ─────────────────────────────── */}
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Tab switcher */}
              <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border mb-5">
                <button
                  type="button"
                  onClick={() => { setIdleMode("file"); setError(null); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                    idleMode === "file"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload file
                </button>
                <button
                  type="button"
                  onClick={() => { setIdleMode("paste"); setError(null); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                    idleMode === "paste"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  Paste JSON
                </button>
              </div>

              <AnimatePresence mode="wait">
                {idleMode === "file" ? (
                  <motion.div
                    key="file-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <button
                      type="button"
                      className={cn(
                        "w-full rounded-2xl border border-dashed transition-colors cursor-pointer",
                        "flex flex-col items-center justify-center gap-4 py-20 px-8 text-center",
                        dragging
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/40 hover:bg-muted/30",
                      )}
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                          dragging ? "bg-primary/10" : "bg-muted",
                        )}
                      >
                        <Upload
                          className={cn(
                            "w-6 h-6 transition-colors",
                            dragging ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">
                          {dragging ? "Drop to import" : "Drop your JSON file here"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse
                        </p>
                      </div>
                    </button>

                    <input
                      ref={fileRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="paste-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    <textarea
                      value={pasteText}
                      onChange={(e) => { setPasteText(e.target.value); setError(null); }}
                      placeholder={FORMAT_EXAMPLE}
                      spellCheck={false}
                      className={cn(
                        "w-full h-64 rounded-2xl border bg-muted/20 px-4 py-4",
                        "text-xs font-mono leading-relaxed resize-none",
                        "placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1",
                        error
                          ? "border-destructive/60 focus:ring-destructive/40"
                          : "border-border focus:ring-ring",
                      )}
                    />
                    <Button
                      className="w-full mt-3 gap-1.5"
                      disabled={!pasteText.trim()}
                      onClick={() => processPaste(pasteText)}
                    >
                      Preview deck
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <FormatGuide />

              <p className="mt-4 text-xs text-center text-muted-foreground/60">
                Want to use an LLM or the API instead?{" "}
                <Link
                  href="/docs"
                  className="text-foreground underline underline-offset-4 hover:no-underline"
                >
                  See the full guide <ArrowRight className="inline w-3 h-3" />
                </Link>
              </p>
            </motion.div>
          )}

          {/* ── Preview: review before importing ────────────────────────── */}
          {step === "preview" && parsed && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Deck header */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/40 border border-border mb-8">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                  {parsed.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={parsed.coverImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileJson className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-base truncate">
                    {parsed.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {parsed.cards.length} card
                    {parsed.cards.length !== 1 ? "s" : ""}
                    {imageCount > 0 && (
                      <>
                        {" "}
                        · {imageCount} image{imageCount !== 1 ? "s" : ""}
                      </>
                    )}
                    {" · Private"}
                  </p>
                  {parsed.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {parsed.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card list */}
              <div className="mb-8">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
                  Cards ({parsed.cards.length})
                </p>
                <div className="space-y-2 max-h-90 overflow-y-auto pr-1">
                  {parsed.cards.map((card, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                    >
                      <span className="text-xs tabular-nums text-muted-foreground/50 pt-0.5 w-5 shrink-0 text-right">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium line-clamp-2 leading-snug">
                          {card.question}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                          {card.answer}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                        {card.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={card.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground/30" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Choose different file
                </button>
                <Button onClick={handleImport} className="ml-auto gap-1.5">
                  Import deck
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Importing: loading state ─────────────────────────────────── */}
          {step === "importing" && (
            <motion.div
              key="importing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-5"
            >
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <div className="text-center">
                <p className="font-medium text-sm">Importing deck…</p>
                {imageCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Saving {imageCount} image{imageCount !== 1 ? "s" : ""} —
                    this may take a moment
                  </p>
                )}
              </div>
            </motion.div>
          )}
    </AnimatePresence>
  );
}
