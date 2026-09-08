import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/db/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const favoritesOnly = searchParams.get("favorites") === "true";
  const supabase = getSupabaseServiceClient();
  let query = supabase.from("generated_images").select("*").order("created_at", { ascending: false });

  if (favoritesOnly) {
    query = query.eq("is_favorite", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ images: data });
}
