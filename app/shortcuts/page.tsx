import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Reveal",
    rows: [
      { keys: ["Space", "Enter"], description: "Flip card" },
      { keys: ["⌘ Enter"], description: "Got it — without flipping" },
      { keys: ["⇧ ⌘ Enter"], description: "Again — without flipping" },
    ],
  },
  {
    title: "Judge",
    rows: [
      { keys: ["↑", "K"], description: "Got it" },
      { keys: ["↓", "J"], description: "Again" },
    ],
  },
  {
    title: "Navigate",
    rows: [
      { keys: ["→"], description: "Skip card" },
      { keys: ["←"], description: "Previous card" },
    ],
  },
  {
    title: "Session",
    rows: [{ keys: ["R"], description: "Restart" }],
  },
];

export default async function ShortcutsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <main className="min-h-svh flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Back to decks
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight mb-8">
          Keyboard shortcuts
        </h1>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                {section.title}
              </p>
              <div className="rounded-2xl border border-border overflow-hidden">
                {section.rows.map((row, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between px-4 py-3",
                      i < section.rows.length - 1 && "border-b border-border",
                    )}
                  >
                    <span className="text-sm text-foreground/80">
                      {row.description}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {row.keys.map((key, ki) => (
                        <span key={ki} className="flex items-center gap-1.5">
                          {ki > 0 && (
                            <span className="text-xs text-muted-foreground/50">
                              or
                            </span>
                          )}
                          <kbd
                            className={cn(
                              "inline-flex items-center justify-center",
                              "rounded-md border border-border bg-muted",
                              "text-xs font-mono text-muted-foreground",
                              "px-2 py-1 min-w-[2rem]",
                              "shadow-[0_1px_0_0_hsl(var(--border))]",
                            )}
                          >
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
