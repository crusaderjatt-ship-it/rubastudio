"use client";

import { Suspense } from "react";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/shared/button";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setIsLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Could not sign in.");
      return;
    }

    router.replace(params.get("next") || "/create");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border border-gold/20 bg-white/82 p-6 shadow-soft">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Private PWA</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-charcoal">Ruba Studio</h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blush text-maroon">
            <Sparkles size={22} />
          </div>
        </div>

        <label className="mb-2 block text-sm font-semibold text-charcoal" htmlFor="password">
          Studio password
        </label>
        <div className="flex items-center rounded-lg border border-gold/30 bg-ivory px-3">
          <LockKeyhole size={18} className="text-gold" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-12 flex-1 bg-transparent px-3 text-charcoal outline-none"
            autoComplete="current-password"
            autoFocus
          />
        </div>

        {error ? <p className="mt-3 rounded-lg bg-blush px-3 py-2 text-sm font-medium text-maroon">{error}</p> : null}

        <Button type="submit" className="mt-5 w-full" disabled={isLoading || !password}>
          {isLoading ? "Opening studio..." : "Open studio"}
        </Button>
      </form>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm rounded-lg border border-gold/20 bg-white/82 p-6 shadow-soft">
        <p className="font-display text-3xl font-bold text-charcoal">Ruba Studio</p>
      </div>
    </main>
  );
}
