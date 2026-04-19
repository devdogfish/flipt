"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowUpDown, Star, Globe, Lock, ChevronRight, X } from "lucide-react";
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
import { DeckCard, cardGradient } from "@/components/deck-card";
import { toggleFavorite } from "@/app/actions";

type SortKey = "newest" | "most-cards" | "alphabetical";

const PAGE_SIZE = 6;

export interface BasketDeckData {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  coverImage?: string | null;
  ownerName?: string | null;
  isOwned: boolean;
  createdAt: string;
}

interface BasketDeckViewProps {
  decks: BasketDeckData[];
  favoriteIds: string[];
  isAuthenticated: boolean;
}

export function BasketDeckView({ decks, favoriteIds, isAuthenticated }: BasketDeckViewProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [localFavorites, setLocalFavorites] = useState(() => new Set(favoriteIds));
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

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

  const handleToggleFavorite = useCallback((deckId: string) => {
    setLocalFavorites((prev) => {
      const next = new Set(prev);
      next.has(deckId) ? next.delete(deckId) : next.add(deckId);
      return next;
    });
    toggleFavorite(deckId);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedDecks((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setSelectedDecks((prev) => prev.filter((d) => d !== id));
  }, []);

  const handleStartStudy = useCallback(() => {
    router.push(`/study?decks=${selectedDecks.join(",")}`);
  }, [router, selectedDecks]);

  const sortDecks = useCallback(
    (items: BasketDeckData[]): BasketDeckData[] => {
      const sorted = [...items];
      if (sort === "alphabetical") sorted.sort((a, b) => a.title.localeCompare(b.title));
      else if (sort === "most-cards") sorted.sort((a, b) => b.cardCount - a.cardCount);
      else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return sorted;
    },
    [sort]
  );

  const filtered = useMemo(() => {
    const f = !query.trim()
      ? decks
      : decks.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
    return sortDecks(f);
  }, [decks, query, sortDecks]);

  const sections = useMemo(() => {
    const favs = filtered.filter((d) => localFavorites.has(d.id));
    const owned = filtered.filter((d) => d.isOwned && !localFavorites.has(d.id));
    const community = filtered.filter((d) => !d.isOwned && !localFavorites.has(d.id));
    return [
      { key: "Favorites", icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />, decks: favs, showBadge: true },
      { key: "Your Decks", icon: <Lock className="w-3.5 h-3.5 text-muted-foreground" />, decks: owned, showBadge: false },
      { key: "Community", icon: <Globe className="w-3.5 h-3.5 text-muted-foreground" />, decks: community, showBadge: false },
    ].filter((s) => s.decks.length > 0);
  }, [filtered, localFavorites]);

  const totalCards = useMemo(
    () => selectedDecks.reduce((sum, id) => sum + (decks.find((d) => d.id === id)?.cardCount ?? 0), 0),
    [selectedDecks, decks]
  );

  const selectedDeckData = useMemo(
    () => selectedDecks.map((id) => decks.find((d) => d.id === id)).filter(Boolean),
    [selectedDecks, decks]
  );

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
        {!isAuthenticated && (
          <Link href="/auth/sign-up">
            <Button size="sm" className="h-9 shrink-0">Sign up</Button>
          </Link>
        )}
      </div>

      {decks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No decks here yet.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No decks match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="space-y-12">
          {sections.map((section, sectionIndex) => {
            const visible = visibleCounts[section.key] ?? PAGE_SIZE;
            const visibleDecks = section.decks.slice(0, visible);
            const hasMore = section.decks.length > visible;

            return (
              <div key={section.key}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-1.5">
                  {section.icon}
                  {section.key}
                </p>
                <div className="grid grid-cols-3 gap-6">
                  {visibleDecks.map((deck, index) => (
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
                        creator={deck.isOwned ? undefined : (deck.ownerName ?? undefined)}
                        isPublic={true}
                        isSelected={selectedDecks.includes(deck.id)}
                        isFavorited={localFavorites.has(deck.id)}
                        showBadge={section.showBadge}
                        onSelect={isAuthenticated ? handleSelect : undefined}
                        onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
                        image={deck.coverImage ?? undefined}
                        priority={sectionIndex === 0 && index < 3}
                      />
                    </motion.div>
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setVisibleCounts((prev) => ({
                          ...prev,
                          [section.key]: (prev[section.key] ?? PAGE_SIZE) + PAGE_SIZE,
                        }))
                      }
                    >
                      Load more
                      <span className="ml-1.5 text-muted-foreground text-xs">
                        {section.decks.length - visible} remaining
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isAuthenticated && decks.length > 0 && (
        <div className="mt-14 rounded-2xl border border-border bg-card p-6 text-center space-y-3">
          <p className="font-semibold text-sm">Sign up to study these decks</p>
          <p className="text-xs text-muted-foreground">
            Track your progress with FSRS spaced repetition and add your own decks to this course.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/auth/sign-up">
              <Button size="sm">Create free account</Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Floating study session bar */}
      <AnimatePresence>
        {selectedDecks.length > 0 && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="bg-card border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
              <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-1">
                    {selectedDeckData.map((deck) => (
                      <button
                        key={deck?.id}
                        onClick={() => handleRemove(deck?.id ?? "")}
                        className="group relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-background hover:ring-destructive/50 transition-all"
                      >
                        {deck?.coverImage ? (
                          <Image src={deck.coverImage} alt={deck.title} fill className="object-cover" />
                        ) : (
                          <div className={cn("w-full h-full bg-linear-to-br", cardGradient(deck?.id ?? ""))} />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <X size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums">{totalCards} cards</span>
                </div>
                <Button onClick={handleStartStudy} size="sm" className="shrink-0 gap-1 rounded-full px-4">
                  Start Studying
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
