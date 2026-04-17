"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyPending, setVerifyPending] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const { error } = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });

    if (error) {
      setError(error.message ?? "Something went wrong.");
    } else {
      setVerifyPending(true);
    }

    setPending(false);
  }

  if (verifyPending) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-card dark:bg-zinc-900 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-none dark:border dark:border-white/20 p-8 text-center space-y-3">
          <p className="text-lg font-medium">Verify your email</p>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to{" "}
            <span className="text-foreground">{email}</span>. Check your inbox
            to continue.
          </p>
          <Link
            href="/sign-in"
            className="inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-3xl bg-card dark:bg-zinc-900 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-none dark:border dark:border-white/20 p-8 space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Create an account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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

          {error && (
            <p className="text-sm text-destructive-foreground bg-destructive/20 border border-destructive/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
