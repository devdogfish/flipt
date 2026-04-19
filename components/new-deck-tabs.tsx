"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DeckMetadataForm } from "@/components/deck-metadata-form";
import { GenerateDeck } from "@/components/generate-deck";

type Tab = "manual" | "generate";

export function NewDeckTabs() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "generate" ? "generate" : "manual",
  );

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl border border-border bg-muted/40 p-1 gap-1">
        {(["manual", "generate"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "manual" ? "Create manually" : "Generate from document"}
          </button>
        ))}
      </div>

      {tab === "manual" ? <DeckMetadataForm mode="create" /> : <GenerateDeck />}
    </div>
  );
}
