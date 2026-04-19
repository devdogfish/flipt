import { DocsSidebar } from "@/components/docs/docs-sidebar";
import type { DocSection } from "@/components/docs/sections";

export function DocsLayout({
  children,
  sections,
}: {
  children: React.ReactNode;
  sections: DocSection[];
}) {
  return (
    <main className="min-h-svh">
      <div className="max-w-5xl mx-auto px-5 pt-16 flex gap-12 pb-32">
        {/* Sidebar — hidden on mobile. The aside holds space in the flex layout;
            the inner div is fixed so it never moves on scroll in either direction.
            Left offset: max(20px, 50vw - 512px + 20px) mirrors the flex container's
            left edge (max-w-5xl = 1024px → half = 512px, plus px-5 = 20px). */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div
            className="fixed top-16 bottom-0 w-52 overflow-y-auto py-4"
            style={{
              left: "max(20px, calc(50vw - 512px + 20px))",
              maskImage: "linear-gradient(to bottom, transparent 0px, black 28px, black calc(100% - 28px), transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 28px, black calc(100% - 28px), transparent 100%)",
            }}
          >
            <DocsSidebar sections={sections} />
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight mb-10">Documentation</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
