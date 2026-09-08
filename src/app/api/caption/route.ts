import { NextResponse } from "next/server";
import { generateCaption } from "@/lib/ai/captions";
import { buildCaptionBrief } from "@/lib/ai/prompt-builder";
import { getSupabaseServiceClient } from "@/lib/db/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as { imageId?: string };

  if (!body.imageId) {
    return NextResponse.json({ error: "Missing image id." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data: image, error: imageError } = await supabase
    .from("generated_images")
    .select("*")
    .eq("id", body.imageId)
    .single();

  if (imageError || !image) {
    return NextResponse.json({ error: imageError?.message || "Image not found." }, { status: 404 });
  }

  const caption = await generateCaption(buildCaptionBrief(image.prompt_text));
  await supabase.from("captions").insert({
    generated_image_id: image.id,
    caption_text: caption,
    hashtags: caption
      .split(/\s+/)
      .filter((part) => part.startsWith("#"))
      .join(" ")
  });

  return NextResponse.json({ caption });
}
