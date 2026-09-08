import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  const expectedPassword = process.env.RUBA_STUDIO_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json({ error: "Private password is not configured." }, { status: 500 });
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const token = process.env.RUBA_STUDIO_SESSION_TOKEN || "ruba-studio-private";
  const response = NextResponse.json({ ok: true });

  response.cookies.set("ruba_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  return response;
}
