"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GeneratedCard {
  id: string;
  question: string;
  answer: string;
}

interface GenerateDeckCardRowProps {
  card: GeneratedCard;
  index: number;
  onUpdate: (id: string, question: string, answer: string) => void;
  onDelete: (id: string) => void;
}

export function GenerateDeckCardRow({
  card,
  index,
  onUpdate,
  onDelete,
}: GenerateDeckCardRowProps) {
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState(card.question);
  const [a, setA] = useState(card.answer);

  function handleSave() {
    if (!q.trim() || !a.trim()) return;
    onUpdate(card.id, q.trim(), a.trim());
    setEditing(false);
  }

  function handleCancel() {
    setQ(card.question);
    setA(card.answer);
    setEditing(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {editing ? (
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Question</label>
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              rows={2}
              className={cn(
                "w-full resize-none rounded-lg border border-border bg-background px-3 py-2",
                "text-sm focus:outline-none focus:ring-1 focus:ring-ring",
              )}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Answer</label>
            <textarea
              value={a}
              onChange={(e) => setA(e.target.value)}
              rows={2}
              className={cn(
                "w-full resize-none rounded-lg border border-border bg-background px-3 py-2",
                "text-sm focus:outline-none focus:ring-1 focus:ring-ring",
              )}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!q.trim() || !a.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              <Check size={12} />
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 flex items-start gap-3">
          <span className="text-xs text-muted-foreground font-mono mt-0.5 w-5 shrink-0 text-right">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-medium leading-snug">{card.question}</p>
            <p className="text-sm text-muted-foreground leading-snug">{card.answer}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(card.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
