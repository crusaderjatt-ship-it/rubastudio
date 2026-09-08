import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/db/supabase";
import { uploadImageBuffer } from "@/lib/storage/images";

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase.from("outfits").select("*").order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ outfits: data });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, "Could not load outfits.") }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload an outfit image." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImageBuffer({
      buffer,
      contentType: file.type || "image/png",
      folder: "outfits"
    });

    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("outfits")
      .insert({
        name: file.name,
        image_urls: [uploaded.publicUrl],
        ai_analysis_json: {
          status: "pending",
          notes: ["Outfit analysis is deferred until Generate is pressed."]
        }
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ outfit: data });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, "Could not upload outfit.") }, { status: 500 });
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
