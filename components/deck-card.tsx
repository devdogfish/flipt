"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check, Globe, Lock, Star, ArrowRight } from "lucide-react";
import Image from "next/image";

interface DeckCardProps {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  lastStudied?: string;
  creator?: string;
  isPublic: boolean;
  isSelected: boolean;
  isFavorited?: boolean;
  showBadge?: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  image?: string;
}

const GRADIENTS = [
  "from-violet-500 to-indigo-700",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
  "from-fuchsia-500 to-purple-700",
  "from-cyan-400 to-sky-600",
  "from-lime-400 to-green-600",
];

export function cardGradient(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

// Height of the description section (px) — must match actual rendered height
const DESC_H = 56;

export function DeckCard({
  id,
  title,
  description,
  cardCount,
  lastStudied,
  creator,
  isPublic,
  isSelected,
  isFavorited,
  showBadge = false,
  onSelect,
  onToggleFavorite,
  image,
  priority = false,
}: DeckCardProps & { priority?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const gradient = cardGradient(id);

  return (
    <div
      className="cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(id)}
    >
      <div
        className={cn(
          "relative w-full aspect-[3/4] rounded-2xl overflow-hidden",
          "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.18)]",
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
      >
        {/* Cover image or gradient placeholder */}
        <div className="absolute inset-0">
          {image ? (
            <Image src={image} alt={title} fill className="object-cover" priority={priority} />
          ) : (
            <div className={cn("w-full h-full bg-linear-to-br", gradient)}>
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl font-black text-white/15 select-none">
                  {title.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Gradient overlay — darker at bottom for text legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />

        {/* Public/Private badge — only shown in Favorites section */}
        {showBadge && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-[10px] leading-none font-medium px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white">
            {isPublic ? (
              <Globe className="w-2.5 h-2.5" />
            ) : (
              <Lock className="w-2.5 h-2.5" />
            )}
            {isPublic ? "Public" : "Private"}
          </span>
        )}

        {/* Card count / selected indicator */}
        {isSelected ? (
          <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        ) : (
          <span className="absolute top-3 right-3 z-10 inline-flex items-center text-[10px] leading-none font-medium px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/90">
            {cardCount} cards
          </span>
        )}

        {/* Slide-up info panel
            Default: translateY(DESC_H) — title visible at bottom, description hidden below card edge
            Hover:   translateY(0)      — description slides up, reveals below title */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-20"
          animate={{ y: hovered ? 0 : DESC_H }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        >
          {/* Title row — always visible in default state */}
          <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-sm leading-tight truncate">
                {title}
              </h3>
              {creator ? (
                <p className="text-[11px] text-white/55 mt-0.5 truncate">by {creator}</p>
              ) : lastStudied ? (
                <p className="text-[11px] text-white/55 mt-0.5">{lastStudied}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(id);
                  }}
                  className="cursor-pointer p-1.5 rounded-lg text-white/60 hover:text-amber-400 transition-colors"
                  aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    className={cn(
                      "w-3.5 h-3.5",
                      isFavorited && "fill-amber-400 text-amber-400",
                    )}
                  />
                </button>
              )}
              <Link
                href={`/decks/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-white/60 hover:text-white transition-colors"
                aria-label={`View ${title}`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Description — slides up from below on hover (DESC_H = this section's height) */}
          <div className="px-3 pt-1 pb-4">
            <p className="text-[11px] text-white/70 leading-relaxed line-clamp-2">
              {description || "No description."}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
