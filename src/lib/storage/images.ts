import { randomUUID } from "crypto";
import { getSupabaseServiceClient } from "@/lib/db/supabase";

const BUCKET_NAME = "ruba-studio";

export async function uploadImageBuffer(params: {
  buffer: Buffer;
  contentType: string;
  folder: "outfits" | "generated" | "edits";
}) {
  const supabase = getSupabaseServiceClient();
  const extension = extensionFromContentType(params.contentType);
  const path = `${params.folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, params.buffer, {
    contentType: params.contentType,
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl
  };
}

export function base64ToBuffer(data: string) {
  return Buffer.from(data, "base64");
}

function extensionFromContentType(contentType: string) {
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  return "png";
}
