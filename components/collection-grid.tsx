"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cardGradient } from "@/components/deck-card";
import { createCollection, deleteCollection, renameCollection } from "@/app/actions";

export interface CollectionGridData {
  id: string;
  name: string;
  deckCount: number;
}

interface CollectionGridProps {
  collections: CollectionGridData[];
}

export function CollectionGrid({ collections: initial }: CollectionGridProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionGridData[]>(initial);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const createRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    setNewName("");
    setIsCreating(false);
    if (!name) return;
    startTransition(async () => {
      const created = await createCollection(name);
      setCollections((prev) => [...prev, { id: created.id, name: created.name, deckCount: 0 }]);
    });
  }

  function handleStartRename(c: CollectionGridData) {
    setRenamingId(c.id);
    setRenameValue(c.name);
    setTimeout(() => renameRef.current?.focus(), 0);
  }

  function handleRenameSubmit(e: React.FormEvent, id: string) {
    e.preventDefault();
    const trimmed = renameValue.trim();
    setRenamingId(null);
    if (!trimmed) return;
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)));
    startTransition(() => renameCollection(id, trimmed));
  }

  function handleDeleteConfirm() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    setCollections((prev) => prev.filter((c) => c.id !== id));
    startTransition(() => deleteCollection(id));
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        {/* New collection card */}
        {isCreating ? (
          <form
            onSubmit={handleCreate}
            className="aspect-[4/3] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 p-4"
          >
            <input
              ref={createRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleCreate}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewName("");
                }
              }}
              autoFocus
              placeholder="Collection name…"
              className="w-full h-8 px-3 rounded-lg text-sm bg-background border border-border outline-none focus:ring-1 focus:ring-primary text-center"
            />
            <p className="text-xs text-muted-foreground">Press Enter to create</p>
          </form>
        ) : (
          <button
            onClick={() => {
              setIsCreating(true);
              setTimeout(() => createRef.current?.focus(), 0);
            }}
            className="aspect-[4/3] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors group"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">New collection</span>
          </button>
        )}

        {collections.map((c) => (
          <CollectionCard
            key={c.id}
            collection={c}
            isRenaming={renamingId === c.id}
            renameValue={renameValue}
            renameRef={renameRef}
            onRenameChange={setRenameValue}
            onRenameSubmit={handleRenameSubmit}
            onRenameCancel={() => setRenamingId(null)}
            onStartRename={() => handleStartRename(c)}
            onDelete={() => setDeleteId(c.id)}
          />
        ))}
      </div>

      {collections.length === 0 && !isCreating && (
        <p className="text-sm text-muted-foreground mt-4">
          No collections yet. Create one to group your decks.
        </p>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              The collection will be deleted. Your decks won&rsquo;t be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CollectionCard({
  collection,
  isRenaming,
  renameValue,
  renameRef,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onStartRename,
  onDelete,
}: {
  collection: CollectionGridData;
  isRenaming: boolean;
  renameValue: string;
  renameRef: React.RefObject<HTMLInputElement | null>;
  onRenameChange: (v: string) => void;
  onRenameSubmit: (e: React.FormEvent, id: string) => void;
  onRenameCancel: () => void;
  onStartRename: () => void;
  onDelete: () => void;
}) {
  const gradient = cardGradient(collection.id);

  return (
    <div className="group relative">
      <Link href={`/collections/${collection.id}`}>
        <div className="aspect-[4/3] rounded-2xl overflow-hidden relative cursor-pointer">
          {/* Gradient background */}
          <div className={cn("absolute inset-0 bg-linear-to-br", gradient)} />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            {isRenaming ? (
              <form onSubmit={(e) => onRenameSubmit(e, collection.id)}>
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={(e) => onRenameChange(e.target.value)}
                  onBlur={(e) => onRenameSubmit(e as unknown as React.FormEvent, collection.id)}
                  onKeyDown={(e) => e.key === "Escape" && onRenameCancel()}
                  className="w-full h-8 px-2 rounded-md text-sm bg-white/20 text-white placeholder:text-white/60 border border-white/30 outline-none"
                  onClick={(e) => e.preventDefault()}
                />
              </form>
            ) : (
              <>
                <p className="text-white font-semibold text-sm leading-tight truncate">{collection.name}</p>
                <p className="text-white/70 text-xs mt-0.5 tabular-nums">
                  {collection.deckCount} {collection.deckCount === 1 ? "deck" : "decks"}
                </p>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Action buttons — shown on hover */}
      {!isRenaming && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.preventDefault(); onStartRename(); }}
            className="w-7 h-7 rounded-md bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            title="Rename"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(); }}
            className="w-7 h-7 rounded-md bg-black/50 hover:bg-destructive flex items-center justify-center text-white transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
