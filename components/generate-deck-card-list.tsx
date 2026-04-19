"use client";

import { AnimatePresence } from "motion/react";
import { GenerateDeckCardRow, type GeneratedCard } from "@/components/generate-deck-card-row";

interface GenerateDeckCardListProps {
  cards: GeneratedCard[];
  onUpdate: (id: string, question: string, answer: string) => void;
  onDelete: (id: string) => void;
}

export function GenerateDeckCardList({ cards, onUpdate, onDelete }: GenerateDeckCardListProps) {
  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {cards.map((card, i) => (
          <GenerateDeckCardRow
            key={card.id}
            card={card}
            index={i}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
