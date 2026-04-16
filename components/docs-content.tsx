"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ChevronRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
        className,
      )}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Code block ────────────────────────────────────────────────────────────────

function CodeBlock({ label, code }: { label?: string; code: string }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden mb-6">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {label}
          </span>
          <CopyButton text={code} />
        </div>
      )}
      {!label && (
        <div className="flex justify-end px-4 py-2 bg-muted/40 border-b border-border">
          <CopyButton text={code} />
        </div>
      )}
      <pre className="px-4 py-4 text-xs font-mono leading-relaxed overflow-x-auto text-foreground/80 bg-muted/20">
        {code}
      </pre>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description?: string;
}) {
  return (
    <div id={id} className="mb-8 mt-15 scroll-mt-8 group">
      <h2 className="text-lg font-semibold tracking-tight mb-2 flex items-center gap-2">
        {title}
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-muted-foreground"
          aria-label={`Link to ${title}`}
        >
          <Hash className="w-4 h-4" />
        </a>
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

// ── Field table ───────────────────────────────────────────────────────────────

const FIELDS = [
  { field: "name", type: "string", req: true, note: "Deck title" },
  {
    field: "description",
    type: "string",
    req: false,
    note: "Short description",
  },
  {
    field: "coverImage",
    type: "string (URL)",
    req: false,
    note: "Deck cover image — mirrored to your storage on import",
  },
  {
    field: "cards[].front.title",
    type: "string",
    req: true,
    note: "The question or prompt shown on the front",
  },
  {
    field: "cards[].front.description",
    type: "string",
    req: false,
    note: "Extra context on the front",
  },
  {
    field: "cards[].back.title",
    type: "string",
    req: true,
    note: "The answer shown on the back",
  },
  {
    field: "cards[].back.description",
    type: "string",
    req: false,
    note: "Explanation or additional detail",
  },
  {
    field: "cards[].back.image",
    type: "string (URL)",
    req: false,
    note: "Card image — mirrored to your storage on import",
  },
];

// ── Code samples ──────────────────────────────────────────────────────────────

const LLM_PROMPT = `Your task is to output a JSON data file — nothing else. Do not build an app, do not write HTML or JavaScript, do not create a UI. Just produce a JSON object containing flashcard data about [TOPIC].

Output it as a downloadable deck.json file if your interface supports it, otherwise wrap it in a \`\`\`json code block. No explanation before or after.

{
  "name": "string — the deck title",
  "description": "string — one sentence description",
  "coverImage": "string (optional) — a relevant Unsplash image URL",
  "cards": [
    {
      "id": "1",
      "front": {
        "title": "string — the question or concept (required)",
        "description": "string (optional) — extra context on the front"
      },
      "back": {
        "title": "string — the answer (required)",
        "description": "string (optional) — explanation or detail",
        "image": "string (optional) — a relevant Unsplash image URL for this card"
      }
    }
  ]
}

Rules:
- Output the JSON data only — no code, no apps, no HTML, no JavaScript
- front.title and back.title are required for every card
- Use clear, concise language
- Aim for 10–20 cards
- For image fields, use real Unsplash URLs in the format:
  https://images.unsplash.com/photo-[ID]?w=800&q=80
  Pick images that genuinely match the card content
- If [TOPIC] has not been replaced with a real topic, stop and ask the user what topic they want`;

const CLAUDE_SKILL = `# flashcardbrowser deck generator
Generate flashcard decks and return them as JSON ready for flashcardbrowser import.
Always return only valid JSON matching the flashcardbrowser deck format.`;

const JSON_EXAMPLE = `{
  "name": "Solar System",
  "description": "Key facts about the planets.",
  "coverImage": "https://example.com/solar-system.jpg",
  "cards": [
    {
      "id": "1",
      "front": {
        "title": "How many planets are in the solar system?"
      },
      "back": {
        "title": "8",
        "description": "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.",
        "image": "https://example.com/planets.jpg"
      }
    },
    {
      "id": "2",
      "front": {
        "title": "What is the largest planet?"
      },
      "back": {
        "title": "Jupiter",
        "description": "Jupiter is more than twice as massive as all other planets combined."
      }
    }
  ]
}`;

const CURL_EXAMPLE = `curl -X POST https://your-app.vercel.app/api/decks \\
  -H "Authorization: Bearer flashcardbrowser_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Deck",
    "cards": [
      {
        "front": { "title": "Question?" },
        "back": { "title": "Answer." }
      }
    ]
  }'`;

const FETCH_EXAMPLE = `const response = await fetch("https://your-app.vercel.app/api/decks", {
  method: "POST",
  headers: {
    "Authorization": "Bearer flashcardbrowser_your_api_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "My Deck",
    cards: [
      {
        front: { title: "Question?" },
        back: { title: "Answer." },
      },
    ],
  }),
})

const deck = await response.json()
// { id, title, cardCount, editUrl }`;

const RESPONSE_EXAMPLE = `{
  "id": "clxyz123...",
  "title": "My Deck",
  "cardCount": 10,
  "editUrl": "https://your-app.vercel.app/decks/clxyz123.../edit"
}`;

// ── Component ─────────────────────────────────────────────────────────────────

export function DocsContent() {
  return (
    <div>
      {/* ── Plain-language intro ──────────────────────────────────────── */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
        flashcardbrowser can turn any topic into a set of flashcards — and you
        don't need to write a single line of code to do it. You can ask any AI
        assistant to generate a deck for you and upload the result in seconds.
        If you're a developer or want to automate things, there's also a simple
        API you can call from scripts, tools, or your own apps.
      </p>

      {/* ── No-code: Use an AI ────────────────────────────────────────── */}
      <SectionHeading id="use-an-ai" title="Generate with any AI" />

      <p className="text-sm text-muted-foreground leading-relaxed -mt-6 mb-8">
        Copy the prompt, replace{" "}
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
          [TOPIC]
        </code>
        , paste it into any AI, then upload the result on the{" "}
        <Link
          href="/decks/import"
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          import page
        </Link>
        .
      </p>

      <CodeBlock label="Prompt template" code={LLM_PROMPT} />

      {/* ── API Reference ─────────────────────────────────────────────── */}
      <SectionHeading
        id="api"
        title="API Reference"
        description="Send decks directly from scripts, automations, or your own apps. Generate an API key in Settings, then POST to /api/decks with a Bearer token."
      />

      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Generate an API key in{" "}
        <Link
          href="/settings"
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          Settings <ChevronRight className="inline w-3 h-3" /> API Keys
        </Link>
        . Pass it as a Bearer token on every request.
      </p>

      {/* Endpoint */}
      <div className="rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-4 py-3 bg-muted/40 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Endpoint
          </p>
        </div>
        <div className="px-4 py-4 flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
            POST
          </span>
          <code className="text-sm font-mono">/api/decks</code>
        </div>
      </div>

      {/* Headers */}
      <div className="rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-4 py-3 bg-muted/40 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Headers
          </p>
        </div>
        <div className="divide-y divide-border/50">
          {[
            ["Authorization", "Bearer <your-api-key>", true],
            ["Content-Type", "application/json", true],
          ].map(([header, value, req]) => (
            <div
              key={header as string}
              className="flex items-center gap-4 px-4 py-3"
            >
              <code className="text-xs font-mono text-foreground/80 w-36 shrink-0">
                {header as string}
              </code>
              <code className="text-xs font-mono text-muted-foreground flex-1">
                {value as string}
              </code>
              <span
                className={cn(
                  "text-xs shrink-0",
                  req ? "text-amber-500" : "text-muted-foreground/40",
                )}
              >
                {req ? "required" : "optional"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* JSON format */}
      <div className="rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-4 py-3 bg-muted/40 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Request body fields
          </p>
        </div>
        <div className="divide-y divide-border/50">
          {FIELDS.map((f) => (
            <div key={f.field} className="flex items-start gap-4 px-4 py-3">
              <code className="text-xs font-mono text-foreground/80 shrink-0 w-52 truncate pt-px">
                {f.field}
              </code>
              <span className="text-xs text-muted-foreground/60 shrink-0 w-24 pt-px">
                {f.type}
              </span>
              <span
                className={cn(
                  "text-xs shrink-0 pt-px",
                  f.req ? "text-amber-500" : "text-muted-foreground/40",
                )}
              >
                {f.req ? "required" : "optional"}
              </span>
              <span className="text-xs text-muted-foreground pt-px hidden sm:block">
                {f.note}
              </span>
            </div>
          ))}
        </div>
      </div>

      <CodeBlock label="Request body example" code={JSON_EXAMPLE} />

      {/* Response */}
      <CodeBlock label="Response (201)" code={RESPONSE_EXAMPLE} />

      {/* Examples */}
      <CodeBlock label="curl" code={CURL_EXAMPLE} />
      <CodeBlock label="fetch" code={FETCH_EXAMPLE} />

      {/* Error table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/40 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Errors
          </p>
        </div>
        <div className="divide-y divide-border/50">
          {[
            ["401", "Missing or invalid API key"],
            ["400", "Invalid JSON body"],
            ["422", "Validation error — see error message for details"],
          ].map(([code, message]) => (
            <div key={code} className="flex items-center gap-4 px-4 py-3">
              <code className="text-xs font-mono font-bold text-destructive w-10 shrink-0">
                {code}
              </code>
              <span className="text-xs text-muted-foreground">{message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
