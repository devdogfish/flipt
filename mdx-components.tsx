import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/docs/code-block";
import { EndpointCard } from "@/components/docs/endpoint-card";
import { FieldTable } from "@/components/docs/field-table";
import { ErrorTable } from "@/components/docs/error-table";

// ── Heading ID slugifier ──────────────────────────────────────────────────────

function slugify(text: unknown): string {
  if (typeof text === "string") {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  return "";
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in (children as object)) {
    return extractText((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

// ── Anchor heading ────────────────────────────────────────────────────────────

function AnchorHeading({
  level,
  children,
  className,
}: {
  level: 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}) {
  const id = slugify(extractText(children));
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return (
    <Tag
      id={id}
      className={cn("scroll-mt-24 group flex items-center gap-2", className)}
    >
      {children}
      <a
        href={`#${id}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-muted-foreground"
        aria-label={`Link to ${extractText(children)}`}
      >
        <Hash className="w-3.5 h-3.5" />
      </a>
    </Tag>
  );
}

// ── MDX component map ─────────────────────────────────────────────────────────

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h2: ({ children }) => (
      <AnchorHeading level={2} className="text-base font-semibold tracking-tight mt-12 mb-4 first:mt-0">
        {children}
      </AnchorHeading>
    ),
    h3: ({ children }) => (
      <AnchorHeading level={3} className="text-sm font-semibold mt-10 mb-3 text-foreground/80">
        {children}
      </AnchorHeading>
    ),
    h4: ({ children }) => (
      <AnchorHeading level={4} className="text-sm font-medium mt-8 mb-2 text-muted-foreground">
        {children}
      </AnchorHeading>
    ),

    // Body text
    p: ({ children }) => (
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{children}</p>
    ),

    // Inline code
    code: ({ children }) => (
      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground/80">
        {children}
      </code>
    ),

    // Fenced code blocks — render as a simple pre
    pre: ({ children }) => (
      <pre className="rounded-xl border border-border px-4 py-4 text-xs font-mono leading-relaxed overflow-x-auto text-foreground/80 bg-muted/20 mb-6">
        {children}
      </pre>
    ),

    // Blockquote — used for "Note:" callouts in MDX
    blockquote: ({ children }) => (
      <div className="border-l-2 border-[#FED43F]/60 pl-4 mb-6 [&>p]:text-muted-foreground [&>p]:text-xs [&>p]:mb-0">
        {children}
      </div>
    ),

    // Links
    a: ({ href, children }) =>
      href?.startsWith("/") || href?.startsWith("#") ? (
        <Link
          href={href}
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          {children}
        </Link>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          {children}
        </a>
      ),

    // Horizontal rule — section separator
    hr: () => <hr className="border-border my-10" />,

    // Tables
    table: ({ children }) => (
      <div className="rounded-xl border border-border overflow-hidden mb-6">
        <table className="w-full text-xs">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/40 border-b border-border">{children}</thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-border/50">{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase tracking-widest text-[10px]">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-muted-foreground font-mono">{children}</td>
    ),

    // Unordered / ordered lists
    ul: ({ children }) => (
      <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside mb-4 leading-relaxed">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside mb-4 leading-relaxed">
        {children}
      </ol>
    ),
    li: ({ children }) => <li>{children}</li>,

    // Custom components available in MDX without imports
    CodeBlock,
    EndpointCard,
    FieldTable,
    ErrorTable,

    ...components,
  };
}
