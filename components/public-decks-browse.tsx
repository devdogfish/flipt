"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowUpDown, Globe, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cardGradient } from "@/components/deck-card";

type SortKey = "newest" | "most-cards" | "alphabetical";

interface DeckData {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  coverImage?: string | null;
  ownerName?: string | null;
  createdAt?: string;
}

interface PublicDecksBrowseProps {
  decks: DeckData[];
}

export function PublicDecksBrowse({ decks }: PublicDecksBrowseProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "f" || e.key === "k") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const sortDecks = useCallback(
    (items: DeckData[]): DeckData[] => {
      const sorted = [...items];
      if (sort === "alphabetical") {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === "most-cards") {
        sorted.sort((a, b) => b.cardCount - a.cardCount);
      } else {
        sorted.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      return sorted;
    },
    [sort],
  );

  const filtered = useMemo(() => {
    const f = !query.trim()
      ? decks
      : decks.filter((d) =>
          d.title.toLowerCase().includes(query.toLowerCase()),
        );
    return sortDecks(f);
  }, [decks, query, sortDecks]);

  if (decks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No public decks yet.</p>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search decks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sort === "newest"
                ? "Newest"
                : sort === "most-cards"
                  ? "Most cards"
                  : "A–Z"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(v) => setSort(v as SortKey)}
            >
              <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="most-cards">
                Most cards
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="alphabetical">A–Z</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/sign-up">
          <Button size="sm" className="h-9 shrink-0">
            Sign up
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No decks match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">
            <Globe className="w-3.5 h-3.5" />
            Community ({filtered.length})
          </div>
          <div className="grid grid-cols-3 gap-6">
            {filtered.map((deck, index) => {
              const gradient = cardGradient(deck.id);
              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link href={`/decks/${deck.id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_4px_24px_-4px_rgba(0,0,0,0.18)] hover:shadow-lg transition-shadow">
                        {deck.coverImage ? (
                          <Image
                            src={deck.coverImage}
                            alt={deck.title}
                            fill
                            className="object-cover"
                            priority={index < 3}
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-full h-full bg-linear-to-br",
                              gradient,
                            )}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-8xl font-black text-white/15 select-none">
                                {deck.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />
                        <span className="absolute top-3 right-3 z-10 inline-flex items-center text-[10px] leading-none font-medium px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/90">
                          {deck.cardCount} cards
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-white text-sm leading-tight truncate">
                              {deck.title}
                            </h3>
                            {deck.ownerName && (
                              <p className="text-[11px] text-white/55 mt-0.5 truncate">
                                by {deck.ownerName}
                              </p>
                            )}
                          </div>
                          <div className="p-1.5 rounded-lg text-white/60 group-hover:text-white transition-colors shrink-0">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Sign-up nudge */}
      <div className="mt-14 rounded-2xl border border-border bg-card p-6 text-center space-y-3">
        <p className="font-semibold text-sm">Sign up to create your own decks</p>
        <p className="text-xs text-muted-foreground">
          Study with FSRS spaced repetition, track your progress, and share decks
          with other Dal students.
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/sign-up">
            <Button size="sm">Create free account</Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
