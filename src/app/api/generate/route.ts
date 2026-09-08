import { NextResponse } from "next/server";
import { analyzeOutfitFromUrl } from "@/lib/ai/outfit-analysis";
import { buildRubaPrompt } from "@/lib/ai/prompt-builder";
import { clampImageCount, resolveAspectRatio, resolveDressType, resolveOption } from "@/lib/ai/custom-options";
import { generateRubaImages } from "@/lib/ai/image-generation";
import { getImageProvider } from "@/lib/ai/provider";
import { getSupabaseServiceClient } from "@/lib/db/supabase";
import type { GenerateRequest, OutfitAnalysis } from "@/types/ruba";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;

    if (!body.outfitId) {
      return NextResponse.json({ error: "Missing outfit id." }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    const { data: outfit, error: outfitError } = await supabase
      .from("outfits")
      .select("*")
      .eq("id", body.outfitId)
      .single();

    if (outfitError || !outfit) {
      return NextResponse.json({ error: outfitError?.message || "Outfit not found." }, { status: 404 });
    }

    let analysis = outfit.ai_analysis_json as OutfitAnalysis & { status?: string };

    if (!analysis.garmentType || analysis.status === "pending") {
      const imageUrl = outfit.image_urls?.[0];
      if (!imageUrl) {
        return NextResponse.json({ error: "Outfit image not found." }, { status: 400 });
      }

      analysis = await analyzeOutfitFromUrl(imageUrl);
      await supabase.from("outfits").update({ ai_analysis_json: analysis }).eq("id", body.outfitId);
    }

    const prompt = buildRubaPrompt({
      analysis,
      pose: resolveOption({ selected: body.pose, custom: body.customPose, fallback: "walking", label: "pose" }),
      backdrop: resolveOption({
        selected: body.backdrop,
        custom: body.customBackdrop,
        fallback: "Chandigarh garden",
        label: "backdrop"
      }),
      expression: resolveOption({
        selected: body.expression,
        custom: body.customExpression,
        fallback: "charming smile",
        label: "expression"
      }),
      footwear: resolveOption({ selected: body.footwear, custom: body.customFootwear, fallback: "match outfit", label: "footwear" }),
      dressType: resolveDressType(body.dressType, body.customDressType),
      aspectRatio: resolveAspectRatio(body.aspectRatio)
    });

    const provider = getImageProvider();
    const uploadedImages = await generateRubaImages(prompt, Math.min(clampImageCount(body.count), 1), outfit.image_urls?.[0], provider, resolveAspectRatio(body.aspectRatio));

    const rows = uploadedImages.map((image) => ({
      outfit_id: body.outfitId,
      prompt_text: prompt,
      image_url: image.publicUrl,
      thumbnail_url: image.publicUrl
    }));

    const { data, error } = await supabase.from("generated_images").insert(rows).select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ images: data, prompt });
  } catch (error) {
    return NextResponse.json({ error: getGenerateErrorMessage(error) }, { status: getGenerateErrorStatus(error) });
  }
}

function getGenerateErrorMessage(error: unknown) {
  if (isOpenAIError(error) && error.code === "billing_hard_limit_reached") {
    return "OpenAI billing hard limit has been reached. Add credits or raise the billing limit, then try Generate again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not generate image.";
}

function getGenerateErrorStatus(error: unknown) {
  if (isOpenAIError(error) && typeof error.status === "number") {
    return error.status;
  }

  if (error instanceof Error && error.message.toLowerCase().includes("google")) {
    return 502;
  }

  if (error instanceof Error && error.message.toLowerCase().includes("deepai")) {
    return 502;
  }

  return 500;
}

function isOpenAIError(error: unknown): error is { code?: string; status?: number } {
  return typeof error === "object" && error !== null && ("code" in error || "status" in error);
}
