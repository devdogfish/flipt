import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-14 bg-transparent">
      <Link href="/" className="text-sm font-medium tracking-tight">
        flashcardbrowser
      </Link>
      <div className="flex items-center gap-1">
        <Link href="/tips">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
          >
            Tips
          </Button>
        </Link>
        <Link href="/docs">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
          >
            Docs
          </Button>
        </Link>
        <Link href="/courses">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
          >
            Courses
          </Button>
        </Link>
        <Link href="/decks">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
          >
            Decks
          </Button>
        </Link>
        <Link href="/auth/sign-in">
          <Button variant="ghost" size="sm" className="text-xs">
            Sign in
          </Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button size="sm" className="text-xs shadow-none">
            Get started
          </Button>
        </Link>
      </div>
    </nav>
  );
}
