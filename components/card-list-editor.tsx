"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { createCard, updateCard, deleteCard } from "@/app/actions";

interface CardData {
  id: string;
  question: string;
  answer: string;
  imageUrl: string | null;
  position: number;
}

interface CardListEditorProps {
  deckId: string;
  initialCards: CardData[];
}

function CardRow({ card, deckId }: { card: CardData; deckId: string }) {
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!question.trim() || !answer.trim()) return;
    startTransition(async () => {
      await updateCard(card.id, question, answer, card.imageUrl);
      setEditing(false);
    });
  }

  function handleCancel() {
    setQuestion(card.question);
    setAnswer(card.answer);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/40 bg-muted/30 p-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Question</Label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Answer</Label>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isPending}
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium leading-snug">{card.question}</p>
        <p className="text-sm text-muted-foreground leading-snug">
          {card.answer}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => setEditing(true)}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete card?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this card and its study history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  deleteCard(card.id);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function AddCardForm({ deckId }: { deckId: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    startTransition(async () => {
      await createCard(deckId, question, answer);
      setQuestion("");
      setAnswer("");
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full gap-2"
      >
        <Plus className="w-4 h-4" />
        Add card
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-primary/40 bg-muted/30 p-4 space-y-3"
    >
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Question</Label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you want to ask?"
          rows={2}
          autoFocus
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Answer</Label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="What's the answer?"
          rows={2}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={isPending}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => {
            setOpen(false);
            setQuestion("");
            setAnswer("");
          }}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function CardListEditor({ deckId, initialCards }: CardListEditorProps) {
  return (
    <div className="space-y-3">
      {initialCards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No cards yet. Add your first card below.
        </p>
      ) : (
        initialCards.map((card) => (
          <CardRow key={card.id} card={card} deckId={deckId} />
        ))
      )}

      <Separator className="my-2" />

      <AddCardForm deckId={deckId} />
    </div>
  );
}
