import { readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

type Provider = "google" | "deepai" | "openai";

type ProviderSettingsRequest = {
  provider?: Provider;
  apiKey?: string;
  model?: string;
  version?: string;
};

const providerKeys: Record<Provider, { apiKey: string; model?: string; version?: string }> = {
  google: {
    apiKey: "GOOGLE_API_KEY",
    model: "GOOGLE_IMAGE_MODEL"
  },
  deepai: {
    apiKey: "DEEPAI_API_KEY",
    model: "DEEPAI_IMAGE_MODEL",
    version: "DEEPAI_IMAGE_VERSION"
  },
  openai: {
    apiKey: "OPENAI_API_KEY",
    model: "OPENAI_IMAGE_MODEL"
  }
};

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Runtime env editing is disabled in production. Add provider keys in Vercel project settings." },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as ProviderSettingsRequest;

  if (!body.provider || !providerKeys[body.provider]) {
    return NextResponse.json({ error: "Choose a supported provider." }, { status: 400 });
  }

  const envPath = path.join(process.cwd(), ".env.local");
  const current = await readEnvFile(envPath);
  const next = parseEnv(current);
  const keys = providerKeys[body.provider];

  next.set("IMAGE_PROVIDER", body.provider);

  if (body.apiKey?.trim()) {
    next.set(keys.apiKey, body.apiKey.trim());
  }

  if (keys.model && body.model?.trim()) {
    next.set(keys.model, body.model.trim());
  }

  if (keys.version && body.version?.trim()) {
    next.set(keys.version, body.version.trim());
  }

  await writeFile(envPath, serializeEnv(next), "utf8");

  return NextResponse.json({
    ok: true,
    provider: body.provider,
    message: "Provider settings saved to .env.local. Restart the app for changes to apply."
  });
}

async function readEnvFile(envPath: string) {
  try {
    return await readFile(envPath, "utf8");
  } catch {
    return "";
  }
}

function parseEnv(content: string) {
  const map = new Map<string, string>();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    map.set(trimmed.slice(0, index), trimmed.slice(index + 1));
  }

  return map;
}

function serializeEnv(map: Map<string, string>) {
  return `${Array.from(map.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")}\n`;
}
