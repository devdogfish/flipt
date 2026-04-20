"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn, authClient } from "@/lib/auth-client";
import { resolveSignInEmail } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "password" | "magic-link";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const resolved = await resolveSignInEmail(email);
    setResolvedEmail(resolved);

    if (mode === "magic-link") {
      const { error } = await authClient.signIn.magicLink({
        email: resolved,
        callbackURL: "/",
      });
      if (error) {
        setError(error.message ?? "Failed to send magic link.");
      } else {
        setMagicLinkSent(true);
      }
    } else {
      const { error } = await signIn.email({
        email: resolved,
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

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-card dark:bg-zinc-900 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-none dark:border dark:border-white/20 p-8 text-center space-y-3">
          <p className="text-lg font-medium">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="text-foreground">{resolvedEmail}</span>.
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
      <div className="rounded-3xl bg-card dark:bg-zinc-900 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-none dark:border dark:border-white/20 p-8 space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>

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
                  href="/auth/forgot-password"
                  tabIndex={-1}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground transition-colors"
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
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
