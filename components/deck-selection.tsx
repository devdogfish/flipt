"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Globe,
  Lock,
  Star,
  ChevronRight,
  Search,
  X,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeckCard, cardGradient } from "@/components/deck-card";
import { toggleFavorite } from "@/app/actions";
import { NewDeckButton } from "./new-deck-button";

type SortKey = "newest" | "most-cards" | "alphabetical";

interface DeckData {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  coverImage?: string | null;
  ownerName?: string | null;
  isPublic?: boolean;
  createdAt?: string;
}

interface DeckSelectionProps {
  userDecks: DeckData[];
  publicDecks: DeckData[];
  favoriteIds: string[];
}

export function DeckSelection({
  userDecks,
  publicDecks,
  favoriteIds,
}: DeckSelectionProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [localFavorites, setLocalFavorites] = useState(
    () => new Set(favoriteIds),
  );

  const handleToggleFavorite = useCallback((deckId: string) => {
    setLocalFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(deckId)) next.delete(deckId);
      else next.add(deckId);
      return next;
    });
    toggleFavorite(deckId);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedDecks((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setSelectedDecks((prev) => prev.filter((d) => d !== id));
  }, []);

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

  const handleStartStudy = useCallback(() => {
    router.push(`/study?decks=${selectedDecks.join(",")}`);
  }, [router, selectedDecks]);

  const allDecks = useMemo(
    () => [...userDecks, ...publicDecks],
    [userDecks, publicDecks],
  );

  const totalCards = useMemo(() => {
    return selectedDecks
      .map((id) => allDecks.find((d) => d.id === id))
      .reduce((sum, deck) => sum + (deck?.cardCount ?? 0), 0);
  }, [selectedDecks, allDecks]);

  const selectedDeckData = useMemo(() => {
    return selectedDecks
      .map((id) => allDecks.find((d) => d.id === id))
      .filter(Boolean);
  }, [selectedDecks, allDecks]);

  const sortDecks = useCallback(
    (decks: DeckData[]): DeckData[] => {
      const sorted = [...decks];
      if (sort === "alphabetical") {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === "most-cards") {
        sorted.sort((a, b) => b.cardCount - a.cardCount);
      } else {
        // newest: sort by createdAt desc (fallback to original order)
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

  const filter = useCallback(
    (decks: DeckData[]) => {
      const filtered = !query.trim()
        ? decks
        : decks.filter((d) =>
            d.title.toLowerCase().includes(query.toLowerCase()),
          );
      return sortDecks(filtered);
    },
    [query, sortDecks],
  );

  const favoriteDecks = filter(
    allDecks.filter((d) => localFavorites.has(d.id)),
  );
  const filteredUserDecks = filter(
    userDecks.filter((d) => !localFavorites.has(d.id)),
  );
  const filteredPublicDecks = filter(
    publicDecks.filter((d) => !localFavorites.has(d.id)),
  );

  const hasAnyDecks = allDecks.length > 0;
  const noResults =
    hasAnyDecks &&
    favoriteDecks.length === 0 &&
    filteredUserDecks.length === 0 &&
    filteredPublicDecks.length === 0;

  return (
    <>
      {/* Search + Sort */}
      {hasAnyDecks && (
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
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 shrink-0"
              >
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
                <DropdownMenuRadioItem value="newest">
                  Newest
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="most-cards">
                  Most cards
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="alphabetical">
                  A–Z
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <NewDeckButton />
        </div>
      )}

      {!hasAnyDecks ? (
        <p className="text-sm text-muted-foreground">No decks available.</p>
      ) : noResults ? (
        <p className="text-sm text-muted-foreground">
          No decks match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-12">
          {[
            {
              icon: (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              ),
              label: "Favorites",
              decks: favoriteDecks,
              isPublic: false,
              showBadge: true,
            },
            {
              icon: <Lock className="w-3.5 h-3.5 text-muted-foreground" />,
              label: "Your Decks",
              decks: filteredUserDecks,
              isPublic: false,
              showBadge: false,
            },
            {
              icon: <Globe className="w-3.5 h-3.5" />,
              label: "Community",
              decks: filteredPublicDecks,
              isPublic: true,
              showBadge: false,
            },
          ]
            .filter((s) => s.decks.length > 0)
            .map((section, sectionIndex) => (
              <div key={section.label}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-1.5">
                  {section.icon}
                  {section.label}
                </p>
                <div className="grid grid-cols-3 gap-6">
                  {section.decks.map((deck, index) => (
                    <motion.div
                      key={deck.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DeckCard
                        id={deck.id}
                        title={deck.title}
                        description={deck.description}
                        cardCount={deck.cardCount}
                        creator={deck.ownerName ?? undefined}
                        isPublic={deck.isPublic ?? section.isPublic}
                        isSelected={selectedDecks.includes(deck.id)}
                        isFavorited={localFavorites.has(deck.id)}
                        showBadge={section.showBadge}
                        onSelect={handleSelect}
                        onToggleFavorite={handleToggleFavorite}
                        image={deck.coverImage ?? undefined}
                        priority={sectionIndex === 0 && index < 3}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
      {/* Floating session bar */}
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
                  {/* Circular deck thumbnails — click to remove */}
                  <div className="flex items-center gap-1">
                    {selectedDeckData.map((deck) => (
                      <button
                        key={deck?.id}
                        onClick={() => handleRemove(deck?.id ?? "")}
                        className="group relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-background hover:ring-destructive/50 transition-all"
                      >
                        {deck?.coverImage ? (
                          <Image
                            src={deck.coverImage}
                            alt={deck.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-full h-full bg-linear-to-br",
                              cardGradient(deck?.id ?? ""),
                            )}
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <X
                            size={12}
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </button>
                    ))}
                  </div>

                  <span className="text-sm text-muted-foreground tabular-nums">
                    {totalCards} cards
                  </span>
                </div>

                <Button
                  onClick={handleStartStudy}
                  size="sm"
                  className="shrink-0 gap-1 rounded-full px-4"
                >
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
