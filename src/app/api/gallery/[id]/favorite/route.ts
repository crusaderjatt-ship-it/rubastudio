import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/db/supabase";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServiceClient();
  const { data: image, error: fetchError } = await supabase
    .from("generated_images")
    .select("is_favorite")
    .eq("id", id)
    .single();

  if (fetchError || !image) {
    return NextResponse.json({ error: fetchError?.message || "Image not found." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("generated_images")
    .update({ is_favorite: !image.is_favorite })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ image: data });
}
