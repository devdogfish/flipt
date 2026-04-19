"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Search, ArrowUpDown, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeckCard } from "@/components/deck-card";

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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return sorted;
    },
    [sort],
  );

  const filtered = useMemo(() => {
    const f = !query.trim()
      ? decks
      : decks.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
    return sortDecks(f);
  }, [decks, query, sortDecks]);

  if (decks.length === 0) {
    return <p className="text-sm text-muted-foreground">No public decks yet.</p>;
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
              {sort === "newest" ? "Newest" : sort === "most-cards" ? "Most cards" : "A–Z"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="most-cards">Most cards</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="alphabetical">A–Z</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/auth/sign-up">
          <Button size="sm" className="h-9 shrink-0">Sign up</Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No decks match &ldquo;{query}&rdquo;.</p>
      ) : (
        <>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">
            <Globe className="w-3.5 h-3.5" />
            Community ({filtered.length})
          </div>
          <div className="grid grid-cols-3 gap-6">
            {filtered.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <DeckCard
                  id={deck.id}
                  title={deck.title}
                  description={deck.description}
                  cardCount={deck.cardCount}
                  creator={deck.ownerName ?? undefined}
                  isPublic={true}
                  image={deck.coverImage ?? undefined}
                  priority={index < 3}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Sign-up nudge */}
      <div className="mt-14 rounded-2xl border border-border bg-card p-6 text-center space-y-3">
        <p className="font-semibold text-sm">Sign up to create your own decks</p>
        <p className="text-xs text-muted-foreground">
          Study with FSRS spaced repetition, track your progress, and share decks with other Dal students.
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/auth/sign-up"><Button size="sm">Create free account</Button></Link>
          <Link href="/auth/sign-in"><Button variant="outline" size="sm">Sign in</Button></Link>
        </div>
      </div>
    </>
  );
}
