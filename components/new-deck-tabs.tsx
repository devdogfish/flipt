"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DeckMetadataForm } from "@/components/deck-metadata-form";
import { GenerateDeck } from "@/components/generate-deck";
import { DeckImport } from "@/components/deck-import";

type Tab = "manual" | "generate" | "import";

const TAB_LABELS: Record<Tab, string> = {
  generate: "Generate with AI",
  manual: "Create manually",
  import: "Import JSON",
};

export function NewDeckTabs() {
  const searchParams = useSearchParams();
  const initialTab = (() => {
    const t = searchParams.get("tab");
    if (t === "manual" || t === "import") return t as Tab;
    return "generate";
  })();
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl border border-border bg-muted/40 p-1 gap-1">
        {(["generate", "manual", "import"] as Tab[]).map((t) => (
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
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "manual" && <DeckMetadataForm mode="create" />}
      {tab === "generate" && <GenerateDeck />}
      {tab === "import" && <DeckImport />}
    </div>
  );
}
