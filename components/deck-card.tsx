"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check, Globe, Lock, Star, User, ArrowRight } from "lucide-react";
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
  onSelect: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  image?: string;
  offsetRotation?: number;
}

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
  onSelect,
  onToggleFavorite,
  image,
  offsetRotation = 0,
}: DeckCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="cursor-pointer"
      style={{ perspective: "1000px" }}
      initial={{ rotate: offsetRotation }}
      animate={{ rotate: isHovered ? 0 : offsetRotation }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(id)}
    >
      {/* Flip container */}
      <motion.div
        className="relative w-56"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isHovered ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {/* FRONT */}
        <div
          className={cn(
            "w-56 rounded-2xl overflow-hidden",
            "bg-card border border-border",
            "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]",
            isSelected &&
              "ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {isSelected && (
            <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          )}

          <div className="h-32 relative overflow-hidden">
            {image ? (
              <Image src={image} alt={title} fill className="object-cover" />
            ) : (
              <div
                className={cn(
                  "w-full h-full",
                  isPublic
                    ? "bg-gradient-to-br from-sky-200 to-sky-100 dark:from-sky-900 dark:to-sky-800"
                    : "bg-gradient-to-br from-amber-200 to-amber-100 dark:from-amber-900 dark:to-amber-800",
                )}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm bg-white/20 text-white">
                {isPublic ? (
                  <Globe className="w-2.5 h-2.5" />
                ) : (
                  <Lock className="w-2.5 h-2.5" />
                )}
                {isPublic ? "Public" : "Private"}
              </span>
            </div>
            <div className="absolute bottom-3 right-3">
              <span className="text-xs font-medium text-white/90 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                {cardCount} cards
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{title}</h3>
                {creator && (
                  <p className="text-xs text-muted-foreground mt-1">by {creator}</p>
                )}
                {!creator && lastStudied && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Studied {lastStudied}
                  </p>
                )}
              </div>
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(id); }}
                  className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-amber-500 transition-colors"
                  aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isFavorited ? "fill-amber-500 text-amber-500" : "",
                    )}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className={cn(
            "absolute inset-0 w-56 rounded-2xl overflow-hidden",
            "bg-card border border-border",
            "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]",
            isSelected &&
              "ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className={cn(
              "h-2 w-full",
              isPublic
                ? "bg-gradient-to-r from-sky-300 to-sky-200 dark:from-sky-800 dark:to-sky-700"
                : "bg-gradient-to-r from-amber-300 to-amber-200 dark:from-amber-800 dark:to-amber-700",
            )}
          />

          <div className="p-4 flex flex-col h-[calc(100%-8px)]">
            <h3 className="font-semibold text-foreground truncate mb-2">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-5">
              {description || "No description."}
            </p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              {creator ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{creator}</span>
                </div>
              ) : (
                <span />
              )}
              <Link
                href={`/decks/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
