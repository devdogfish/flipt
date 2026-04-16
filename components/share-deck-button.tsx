"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Share2, X, UserPlus, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  searchUsersForSharing,
  getDeckShares,
  shareDeckWithUser,
  unshareDeck,
} from "@/app/actions";

interface ShareDeckButtonProps {
  deckId: string;
  deckTitle: string;
}

interface UserResult {
  id: string;
  name: string | null;
  email: string;
}

interface ShareEntry {
  userId: string;
  name: string | null;
  email: string;
  createdAt: string;
}

export function ShareDeckButton({ deckId, deckTitle }: ShareDeckButtonProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Load existing shares when dialog opens
  useEffect(() => {
    if (!open) return;
    getDeckShares(deckId).then(setShares).catch(() => {});
  }, [open, deckId]);

  // Debounced user search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await searchUsersForSharing(query);
        // Filter out users already shared with
        const sharedIds = new Set(shares.map((s) => s.userId));
        setResults(found.filter((u) => !sharedIds.has(u.id)));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, shares]);

  const handleShare = useCallback(
    (user: UserResult) => {
      setError(null);
      startTransition(async () => {
        try {
          await shareDeckWithUser(deckId, user.id);
          setShares((prev) => [
            ...prev,
            {
              userId: user.id,
              name: user.name,
              email: user.email,
              createdAt: new Date().toISOString(),
            },
          ]);
          setResults((prev) => prev.filter((u) => u.id !== user.id));
          setQuery("");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to share.");
        }
      });
    },
    [deckId],
  );

  const handleUnshare = useCallback(
    (userId: string) => {
      setError(null);
      startTransition(async () => {
        try {
          await unshareDeck(deckId, userId);
          setShares((prev) => prev.filter((s) => s.userId !== userId));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to remove access.");
        }
      });
    },
    [deckId],
  );

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setOpen(true)}
      >
        <Share2 data-icon="inline-start" />
        Share
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share &ldquo;{deckTitle}&rdquo;</DialogTitle>
            <DialogDescription>
              Invite other users to view and study this private deck. Search by
              name or email.
            </DialogDescription>
          </DialogHeader>

          {/* Search input */}
          <div className="relative mt-2">
            {searching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            )}
            <Input
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Search results */}
          {results.length > 0 && (
            <div className="rounded-lg border border-border bg-card divide-y divide-border max-h-48 overflow-y-auto">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.name ?? user.email}
                    </p>
                    {user.name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={() => handleShare(user)}
                    disabled={isPending}
                  >
                    <UserPlus data-icon="inline-start" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          {query.trim() && results.length === 0 && !searching && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No users found matching &ldquo;{query}&rdquo;
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive-foreground bg-destructive/20 border border-destructive/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Current shares */}
          {shares.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                  Shared with ({shares.length})
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {shares.map((share) => (
                    <div
                      key={share.userId}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                          {(share.name ?? share.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {share.name ?? share.email}
                          </p>
                          {share.name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {share.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnshare(share.userId)}
                        disabled={isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10 shrink-0"
                        aria-label={`Remove ${share.name ?? share.email}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {shares.length === 0 && !query && (
            <p className="text-xs text-muted-foreground text-center py-3">
              No one has access yet. Search above to invite someone.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
