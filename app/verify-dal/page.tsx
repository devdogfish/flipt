"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { sendDalVerification } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

function VerifyDalForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [dalEmail, setDalEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "expired"
      ? "That verification link has expired. Please request a new one."
      : errorParam === "invalid"
        ? "Invalid verification link. Please request a new one."
        : null,
  );

  useEffect(() => {
    if (errorParam) {
      window.history.replaceState({}, "", "/verify-dal");
    }
  }, [errorParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      await sendDalVerification(dalEmail);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-8 text-center space-y-3">
        <p className="text-lg font-medium">Check your Dal inbox</p>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="text-foreground font-medium">{dalEmail}</span>.
          Click it to link your Dal account.
        </p>
        <p className="text-xs text-muted-foreground">
          The link expires in 1 hour.
        </p>
        <button
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          onClick={() => {
            setSent(false);
            setDalEmail("");
          }}
        >
          Use a different address
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-8 space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Flipt"
            width={28}
            height={28}
            className="rounded"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Verify your Dal email
          </h1>
          <p className="text-sm text-muted-foreground">
            Flipt is for Dalhousie students. Link your{" "}
            <span className="text-foreground">@dal.ca</span> email to continue.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dal-email">Dal email address</Label>
          <Input
            id="dal-email"
            type="email"
            placeholder="bXXXXXXX@dal.ca"
            value={dalEmail}
            onChange={(e) => setDalEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-destructive-foreground bg-destructive/20 border border-destructive/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send verification link"}
        </Button>
      </form>
    </div>
  );
}

export default function VerifyDalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={null}>
          <VerifyDalForm />
        </Suspense>
      </div>
    </div>
  );
}
