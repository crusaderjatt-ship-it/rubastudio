"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/shared/button";

type Provider = "google" | "deepai" | "openai";

const providers: Array<{ value: Provider; label: string; helper: string; defaultModel: string; version?: string }> = [
  {
    value: "google",
    label: "Gemini",
    helper: "Fast 1K JPEG generation with outfit references (roughly 1080p level; dimensions depend on aspect ratio). Existing images keep their original resolution.",
    defaultModel: "gemini-3.1-flash-image"
  },
  {
    value: "deepai",
    label: "DeepAI",
    helper: "Requires DeepAI Pro; text-to-image fallback only.",
    defaultModel: "text2img",
    version: "standard"
  },
  {
    value: "openai",
    label: "OpenAI",
    helper: "Use only when API billing is available.",
    defaultModel: "gpt-image-2"
  }
];

export function ProviderSettingsForm() {
  const [provider, setProvider] = useState<Provider>("google");
  const selected = providers.find((item) => item.value === provider) || providers[0];
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(selected.defaultModel);
  const [version, setVersion] = useState(selected.version || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function onProviderChange(nextProvider: Provider) {
    const next = providers.find((item) => item.value === nextProvider) || providers[0];
    setProvider(nextProvider);
    setModel(next.defaultModel);
    setVersion(next.version || "");
    setStatus("");
    setError("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");
    setError("");

    const response = await fetch("/api/settings/provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey, model, version })
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    setIsSaving(false);

    if (!response.ok) {
      setError(data.error || "Could not save provider settings.");
      return;
    }

    setApiKey("");
    setStatus(data.message || "Provider settings saved. Restart the app.");
  }

  return (
    <section className="rounded-lg border border-gold/20 bg-white/82 p-4 shadow-soft">
      <h2 className="font-display text-2xl font-bold text-charcoal">API Provider</h2>
      <p className="mt-1 text-sm text-charcoal/65">Save local development provider keys into .env.local.</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {providers.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onProviderChange(item.value)}
              className={`rounded-lg border px-2 py-2 text-left ${
                provider === item.value ? "border-maroon bg-maroon text-white" : "border-gold/30 bg-ivory text-charcoal"
              }`}
            >
              <span className="block text-sm font-bold">{item.label}</span>
            </button>
          ))}
        </div>

        <p className="rounded-lg bg-gold/12 px-3 py-2 text-xs font-semibold text-charcoal/70">{selected.helper}</p>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-charcoal">API key</span>
          <input
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            type="password"
            className="min-h-11 w-full rounded-lg border border-gold/30 bg-ivory px-3 text-sm outline-none focus:border-maroon"
            placeholder="Paste new key only when changing it"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-charcoal">Model</span>
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-gold/30 bg-ivory px-3 text-sm outline-none focus:border-maroon"
          />
        </label>

        {provider === "deepai" ? (
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-charcoal">DeepAI version</span>
            <input
              value={version}
              onChange={(event) => setVersion(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-gold/30 bg-ivory px-3 text-sm outline-none focus:border-maroon"
              placeholder="standard or hd"
            />
          </label>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save provider settings"}
        </Button>
      </form>

      {status ? <p className="mt-3 rounded-lg bg-gold/12 px-3 py-2 text-sm font-semibold text-charcoal">{status}</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-blush px-3 py-2 text-sm font-semibold text-maroon">{error}</p> : null}
      <p className="mt-3 text-xs font-medium text-charcoal/55">
        For Vercel deployment, add the same variables in Vercel Project Settings. Runtime editing is local-only.
      </p>
    </section>
  );
}
