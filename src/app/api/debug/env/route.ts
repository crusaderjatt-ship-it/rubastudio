import { NextResponse } from "next/server";

const keys = [
  "RUBA_STUDIO_PASSWORD",
  "RUBA_STUDIO_SESSION_TOKEN",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "OPENAI_IMAGE_MODEL",
  "IMAGE_PROVIDER",
  "GOOGLE_API_KEY",
  "GOOGLE_IMAGE_MODEL",
  "DEEPAI_API_KEY",
  "DEEPAI_IMAGE_MODEL",
  "DEEPAI_IMAGE_VERSION"
];

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Debug route is disabled in production." }, { status: 404 });
  }

  return NextResponse.json({
    env: keys.map((key) => {
      const value = process.env[key] || "";
      return {
        key,
        present: value.length > 0,
        length: value.length,
        startsWith: value ? value.slice(0, safePrefixLength(key)) : "",
        hasWhitespace: /\s/.test(value)
      };
    })
  });
}

function safePrefixLength(key: string) {
  if (key.includes("KEY") || key.includes("PASSWORD") || key.includes("TOKEN")) {
    return 6;
  }

  return 24;
}
