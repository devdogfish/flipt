"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  GraduationCap,
  Lock,
  Plus,
  Share2,
  Star,
  ChevronRight,
  Search,
  X,
  ArrowUpDown,
  RefreshCw,
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
import { CollectionStrip, type CollectionData } from "@/components/collection-strip";
import { toggleFavorite, regenerateAllCovers, createCourseCollection } from "@/app/actions";
import { NewDeckButton } from "./new-deck-button";

type SortKey = "newest" | "most-cards" | "alphabetical";

const PAGE_SIZE = 6; // 2 rows × 3 columns

interface DeckData {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  coverImage?: string | null;
  ownerName?: string | null;
  isPublic?: boolean;
  createdAt?: string;
  collectionIds?: string[];
}

export interface CourseCollectionData {
  id: string;
  name: string;
  courseCode: string;
  deckCount: number;
}

interface DeckSelectionProps {
  userDecks: DeckData[];
  sharedDecks?: DeckData[];
  publicDecks: DeckData[];
  favoriteIds: string[];
  collections?: CollectionData[];
  courseCollections?: CourseCollectionData[];
}

export function DeckSelection({
  userDecks,
  sharedDecks = [],
  publicDecks,
  favoriteIds,
  collections: initialCollections = [],
  courseCollections = [],
}: DeckSelectionProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [localFavorites, setLocalFavorites] = useState(
    () => new Set(favoriteIds),
  );
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [collections, setCollections] = useState<CollectionData[]>(initialCollections);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const [regenStatus, setRegenStatus] = useState<string | null>(null);
  const [courseCollectionsList, setCourseCollectionsList] = useState<CourseCollectionData[]>(courseCollections);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [courseError, setCourseError] = useState<string | null>(null);
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const courseCodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVisibleCounts({});
  }, [activeCollectionId]);

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

  async function handleAddCourseSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = newCourseCode.trim();
    const name = newCourseName.trim();
    if (!code || !name) return;
    setCourseError(null);
    setCourseSubmitting(true);
    try {
      const created = await createCourseCollection(code, name);
      setCourseCollectionsList((prev) => [...prev, { id: created.id, courseCode: created.courseCode, name: created.name, deckCount: 1 }]);
      setIsAddingCourse(false);
      setNewCourseCode("");
      setNewCourseName("");
      router.push(`/decks/course/${created.id}`);
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCourseSubmitting(false);
    }
  }

  const allDecks = useMemo(
    () => [...userDecks, ...sharedDecks, ...publicDecks],
    [userDecks, sharedDecks, publicDecks],
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
        sorted.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      return sorted;
    },
    [sort],
  );

  const filterByQuery = useCallback(
    (decks: DeckData[]) => {
      const filtered = !query.trim()
        ? decks
        : decks.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
      return sortDecks(filtered);
    },
    [query, sortDecks],
  );

  const filterByCollection = useCallback(
    (decks: DeckData[]) => {
      if (!activeCollectionId) return decks;
      return decks.filter((d) => d.collectionIds?.includes(activeCollectionId));
    },
    [activeCollectionId],
  );

  const filter = useCallback(
    (decks: DeckData[]) => filterByQuery(filterByCollection(decks)),
    [filterByQuery, filterByCollection],
  );

  const favoriteDecks = filter(allDecks.filter((d) => localFavorites.has(d.id)));
  const filteredUserDecks = filter(userDecks.filter((d) => !localFavorites.has(d.id)));
  const filteredSharedDecks = activeCollectionId
    ? []
    : filter(sharedDecks.filter((d) => !localFavorites.has(d.id)));
  const filteredPublicDecks = activeCollectionId
    ? []
    : filter(publicDecks.filter((d) => !localFavorites.has(d.id)));

  const hasAnyDecks = allDecks.length > 0;
  const noResults =
    hasAnyDecks &&
    favoriteDecks.length === 0 &&
    filteredUserDecks.length === 0 &&
    filteredSharedDecks.length === 0 &&
    filteredPublicDecks.length === 0;

  const sections = [
    {
      icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />,
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
      icon: <Share2 className="w-3.5 h-3.5 text-muted-foreground" />,
      label: "Shared with me",
      decks: filteredSharedDecks,
      isPublic: false,
      showBadge: true,
    },
    {
      icon: <Globe className="w-3.5 h-3.5" />,
      label: "Community",
      decks: filteredPublicDecks,
      isPublic: true,
      showBadge: false,
    },
  ].filter((s) => s.decks.length > 0);

  return (
    <>
      {/* Dal Courses — course collections as distinct cards */}
      <div className="mb-10">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5" />
          Dal Courses
        </p>
        <div className="flex flex-col gap-2">
          {courseCollectionsList.map((c) => (
            <Link key={c.id} href={`/decks/course/${c.id}`}>
              <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-muted/40 hover:border-border/80 hover:bg-muted/60 transition-colors group">
                <span className="shrink-0 inline-flex items-center text-[11px] leading-none font-bold px-2.5 py-1 rounded-full bg-foreground text-background">
                  {c.courseCode}
                </span>
                <span className="flex-1 min-w-0 text-sm font-medium truncate">{c.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{c.deckCount} decks</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </div>
            </Link>
          ))}

          {/* Add course form / button */}
          {isAddingCourse ? (
            <form onSubmit={handleAddCourseSubmit} className="flex flex-col gap-2 px-4 py-3 rounded-xl border border-dashed border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <input
                  ref={courseCodeRef}
                  value={newCourseCode}
                  onChange={(e) => { setNewCourseCode(e.target.value.toUpperCase()); setCourseError(null); }}
                  placeholder="Course code (e.g. BIOL 2030)"
                  className="h-8 px-3 rounded-lg text-sm bg-background border border-border outline-none focus:ring-1 focus:ring-primary w-52 font-mono uppercase placeholder:normal-case placeholder:font-sans"
                  disabled={courseSubmitting}
                  autoFocus
                />
                <input
                  value={newCourseName}
                  onChange={(e) => { setNewCourseName(e.target.value); setCourseError(null); }}
                  placeholder="Course name"
                  className="h-8 px-3 rounded-lg text-sm bg-background border border-border outline-none focus:ring-1 focus:ring-primary flex-1"
                  disabled={courseSubmitting}
                />
                <button
                  type="submit"
                  disabled={courseSubmitting || !newCourseCode.trim() || !newCourseName.trim()}
                  className="h-8 px-3 rounded-lg text-sm font-medium bg-foreground text-background disabled:opacity-40 transition-opacity"
                >
                  {courseSubmitting ? "Adding…" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAddingCourse(false); setNewCourseCode(""); setNewCourseName(""); setCourseError(null); }}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              {courseError && <p className="text-xs text-destructive">{courseError}</p>}
            </form>
          ) : (
            <button
              onClick={() => { setIsAddingCourse(true); setTimeout(() => courseCodeRef.current?.focus(), 0); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Plus size={14} />
              Add a course
            </button>
          )}
        </div>
      </div>

      {/* Personal collections strip */}
      {(collections.length > 0 || hasAnyDecks) && (
        <div className="mb-8">
          <CollectionStrip
            collections={collections}
            activeId={activeCollectionId}
            onSelect={setActiveCollectionId}
            onCollectionsChange={setCollections}
          />
        </div>
      )}

      {/* Search + Sort + New deck */}
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
        {hasAnyDecks && (
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
        )}
        <NewDeckButton />
          {process.env.NEXT_PUBLIC_VERCEL_ENV !== "production" && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 shrink-0 border-dashed border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              disabled={regenStatus === "running"}
              onClick={async () => {
                setRegenStatus("running");
                try {
                  const res = await regenerateAllCovers();
                  setRegenStatus(
                    `Done: ${res.success}/${res.total}${res.failed.length ? ` (failed: ${res.failed.join(", ")})` : ""}`,
                  );
                  window.location.reload();
                } catch {
                  setRegenStatus("Error");
                }
              }}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", regenStatus === "running" && "animate-spin")} />
              {regenStatus === "running" ? "Regenerating..." : "Regen All Covers"}
            </Button>
          )}
        </div>
      {regenStatus && regenStatus !== "running" && (
        <p className="text-xs text-muted-foreground mb-4">{regenStatus}</p>
      )}

      {!hasAnyDecks ? (
        <p className="text-sm text-muted-foreground">No decks available.</p>
      ) : noResults ? (
        <p className="text-sm text-muted-foreground">
          {activeCollectionId ? "No decks in this collection yet." : `No decks match "${query}".`}
        </p>
      ) : (
        <div className="space-y-12">
          {sections.map((section, sectionIndex) => {
            const visible = visibleCounts[section.label] ?? PAGE_SIZE;
            const visibleDecks = section.decks.slice(0, visible);
            const hasMore = section.decks.length > visible;

            return (
              <div key={section.label}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-1.5">
                  {section.icon}
                  {section.label}
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

                {hasMore && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setVisibleCounts((prev) => ({
                          ...prev,
                          [section.label]: (prev[section.label] ?? PAGE_SIZE) + PAGE_SIZE,
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
