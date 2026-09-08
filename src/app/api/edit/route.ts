import { NextResponse } from "next/server";
import { editRubaImage } from "@/lib/ai/image-generation";
import { cleanMinorEditInstruction } from "@/lib/ai/custom-options";
import { buildMinorEditPrompt } from "@/lib/ai/prompt-builder";
import { getSupabaseServiceClient } from "@/lib/db/supabase";

const quickEdits: Record<string, string> = {
  smile: "Make the smile more charming while keeping the same face and body.",
  fullBody: "Make it a clear full-body image while preserving the same outfit exactly.",
  footwear: "Change footwear to clean white footwear only.",
  background: "Keep the same outfit and Ruba identity, but make the backdrop more realistic and premium.",
  sameFace: "Keep the same face, body, outfit, and backdrop. Improve realism only."
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { imageId?: string; action?: string; instruction?: string };

    if (!body.imageId) {
      return NextResponse.json({ error: "Missing image id." }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    const { data: image, error: imageError } = await supabase.from("generated_images").select("*").eq("id", body.imageId).single();

    if (imageError || !image) {
      return NextResponse.json({ error: imageError?.message || "Image not found." }, { status: 404 });
    }

    const rawInstruction = body.instruction || quickEdits[body.action || ""] || quickEdits.sameFace;
    const instruction = cleanMinorEditInstruction(rawInstruction);

    if (!instruction) {
      return NextResponse.json({ error: "Edit request was blocked or empty. Use a small fashion/photo tweak under 50 words." }, { status: 400 });
    }

    const prompt = buildMinorEditPrompt(instruction);
    const uploaded = await editRubaImage({ imageUrl: image.image_url, prompt });
    const { data: newImage, error: insertError } = await supabase
      .from("generated_images")
      .insert({
        outfit_id: image.outfit_id,
        prompt_text: prompt,
        image_url: uploaded.publicUrl,
        thumbnail_url: uploaded.publicUrl
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabase.from("edit_history").insert({
      generated_image_id: image.id,
      instruction,
      previous_image_url: image.image_url,
      new_image_url: uploaded.publicUrl
    });

    return NextResponse.json({ image: newImage });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not edit image." }, { status: 500 });
  }
}
