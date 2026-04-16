"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Debug: seed users (remove this block when no longer needed) ───────────
const IS_DEV = process.env.NODE_ENV === "development";
const SEED_USERS = [
  {
    label: "flashcardbrowser (seed)",
    email: "seed@flashcardbrowser.com",
    password: "flashcardbrowser1234",
  },
  {
    label: "Marcus",
    email: "marcus@flashcardbrowser.com",
    password: "marcus1234",
  },
];
// ──────────────────────────────────────────────────────────────────────────

type Mode = "password" | "magic-link";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  // ── Debug: auto-fill first seed user on mount ──────────────────────────
  useEffect(() => {
    if (IS_DEV) {
      setEmail(SEED_USERS[0].email);
      setPassword(SEED_USERS[0].password);
    }
  }, []);

  function handleDebugUserSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const user = SEED_USERS.find((u) => u.email === e.target.value);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  }
  // ──────────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "magic-link" && !email.trim().toLowerCase().endsWith("@dal.ca")) {
      setError("Magic link sign-in requires a @dal.ca email address.");
      return;
    }

    setPending(true);

    if (mode === "magic-link") {
      const { error } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
      });
      if (error) {
        setError(error.message ?? "Failed to send magic link.");
      } else {
        setMagicLinkSent(true);
      }
    } else {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      if (error) {
        setError(error.message ?? "Invalid email or password.");
      } else {
        router.push("/");
      }
    }

    setPending(false);
  }

  async function handleMicrosoft() {
    await signIn.social({ provider: "microsoft", callbackURL: "/" });
  }

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-8 text-center space-y-3">
          <p className="text-lg font-medium">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="text-foreground">{email}</span>.
          </p>
          <button
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            onClick={() => {
              setMagicLinkSent(false);
              setEmail("");
            }}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Dalhousie students only
          </p>
        </div>

        {/* ── Debug panel (dev only) ── */}
        {IS_DEV && (
          <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500/80">
              Dev · Seed user
            </p>
            <select
              className="w-full rounded-md bg-transparent text-sm text-foreground border border-yellow-500/30 px-2 py-1 focus:outline-none"
              value={email}
              onChange={handleDebugUserSelect}
            >
              {SEED_USERS.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.label} — {u.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {mode === "password" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive-foreground bg-destructive/20 border border-destructive/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? "Please wait…"
              : mode === "magic-link"
                ? "Send magic link"
                : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex-1 border-t border-border" />
          or
          <span className="flex-1 border-t border-border" />
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleMicrosoft}
            type="button"
          >
            <MicrosoftIcon />
            Continue with Microsoft
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            type="button"
            onClick={() => {
              setMode(mode === "password" ? "magic-link" : "password");
              setError(null);
            }}
          >
            {mode === "password"
              ? "Sign in with magic link instead"
              : "Sign in with password instead"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022" />
      <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00" />
      <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF" />
      <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900" />
    </svg>
  );
}
