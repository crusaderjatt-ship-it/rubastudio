import { readdir, readFile } from "fs/promises";
import path from "path";
import { base64ToBuffer, uploadImageBuffer } from "@/lib/storage/images";
import { getImageModel, getOpenAIClient } from "@/lib/ai/openai";
import { getDeepAIApiKey, getDeepAIImageVersion, getGoogleApiKey, getGoogleImageModel, getImageProvider, type ImageProvider } from "@/lib/ai/provider";

type GoogleInteractionResponse = {
  output_image?: GoogleImageBlock;
  outputImage?: GoogleImageBlock;
  error?: { message?: string; code?: number; status?: string };
};

type GoogleImageBlock = {
  data?: string;
  mime_type?: string;
  mimeType?: string;
};

type ReferenceImage = {
  data: string;
  mimeType: string;
};

const RUBA_REFERENCE_DIR = "ruba-references";
const DEFAULT_RUBA_REFERENCE_FILES = [
  "User attachment (1).png",
  "User attachment (2).png",
  "User attachment (4).png"
];

type DeepAIResponse = {
  id?: string;
  output_url?: string;
  err?: string;
  status?: string;
};

export async function generateRubaImages(prompt: string, count: number, referenceImageUrl?: string, providerOverride?: ImageProvider, aspectRatio = "4:5") {
  const provider = getImageProvider(providerOverride);

  if (provider === "google") {
    return generateGoogleRubaImages(prompt, count, referenceImageUrl, aspectRatio);
  }

  if (provider === "deepai") {
    return generateDeepAIRubaImages(prompt, count);
  }

  return generateOpenAIRubaImages(prompt, count);
}

async function generateOpenAIRubaImages(prompt: string, count: number) {
  const client = getOpenAIClient();
  const results = [];

  for (let index = 0; index < count; index += 1) {
    const image = await client.images.generate({
      model: getImageModel(),
      prompt,
      size: "1024x1536",
      quality: "medium",
      n: 1
    });

    const b64 = image.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("Image generation returned no image data.");
    }

    results.push(
      await uploadImageBuffer({
        buffer: base64ToBuffer(b64),
        contentType: "image/png",
        folder: "generated"
      })
    );
  }

  return results;
}

async function generateGoogleRubaImages(prompt: string, count: number, referenceImageUrl?: string, aspectRatio = "4:5") {
  const results = [];
  const outfitImage = referenceImageUrl ? await fetchImageAsBase64(referenceImageUrl) : undefined;
  const rubaReferences = await loadRubaReferenceImages();
  const referenceImages = [outfitImage, ...rubaReferences].filter((image): image is ReferenceImage => Boolean(image));

  for (let index = 0; index < count; index += 1) {
    const image = await createGoogleImage(prompt, referenceImages, aspectRatio);

    results.push(
      await uploadImageBuffer({
        buffer: base64ToBuffer(image.data),
        contentType: image.mimeType,
        folder: "generated"
      })
    );
  }

  return results;
}

async function generateDeepAIRubaImages(prompt: string, count: number) {
  const results = [];

  for (let index = 0; index < count; index += 1) {
    const image = await createDeepAIImage(prompt);
    results.push(
      await uploadImageBuffer({
        buffer: image.buffer,
        contentType: image.contentType,
        folder: "generated"
      })
    );
  }

  return results;
}

async function createDeepAIImage(prompt: string) {
  const formData = new FormData();
  formData.append("text", prompt);
  formData.append("width", "576");
  formData.append("height", "1024");
  formData.append("image_generator_version", getDeepAIImageVersion());
  formData.append("negative_prompt", "bad anatomy, blurry, cropped, extra limbs, extra fingers, text, watermark, logo, low quality");

  const response = await fetch("https://api.deepai.org/api/text2img", {
    method: "POST",
    headers: {
      "api-key": getDeepAIApiKey()
    },
    body: formData
  });

  const text = await response.text();
  const data = parseDeepAIResponse(text);

  if (!response.ok || data.err || data.status) {
    throw new Error(data.err || data.status || `DeepAI image generation failed with status ${response.status}.`);
  }

  if (!data.output_url) {
    throw new Error("DeepAI image generation returned no output_url.");
  }

  const imageResponse = await fetch(data.output_url);
  if (!imageResponse.ok) {
    throw new Error("Could not download DeepAI generated image.");
  }

  return {
    buffer: Buffer.from(await imageResponse.arrayBuffer()),
    contentType: imageResponse.headers.get("content-type") || "image/jpeg"
  };
}

async function createGoogleImage(prompt: string, referenceImages: ReferenceImage[] = [], aspectRatio?: string) {
  const input: Array<Record<string, string>> = [
    {
      type: "text",
      text: prompt
    }
  ];

  for (const referenceImage of referenceImages) {
    input.push({
      type: "image",
      mime_type: referenceImage.mimeType,
      data: referenceImage.data
    });
  }

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getGoogleApiKey()
    },
    body: JSON.stringify({
      model: getGoogleImageModel(),
      input,
      response_format: {
        type: "image",
        mime_type: "image/jpeg",
        image_size: "1K",
        ...(aspectRatio ? { aspect_ratio: aspectRatio } : {})
      }
    })
  });

  const text = await response.text();
  const data = parseGoogleResponse(text);

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Google image generation failed with status ${response.status}.`);
  }

  const outputImage = data.output_image || data.outputImage || findBase64Image(data);
  const imageData = outputImage?.data;

  if (!imageData) {
    throw new Error("Google image generation returned no image data.");
  }

  return {
    data: imageData,
    mimeType: outputImage?.mime_type || outputImage?.mimeType || "image/png"
  };
}

async function loadRubaReferenceImages(): Promise<ReferenceImage[]> {
  const files = await getRubaReferenceFiles();

  return Promise.all(
    files.map(async (file) => ({
      data: (await readFile(path.join(process.cwd(), "public", RUBA_REFERENCE_DIR, file))).toString("base64"),
      mimeType: getImageMimeType(file)
    }))
  );
}

async function getRubaReferenceFiles() {
  const directory = path.join(process.cwd(), "public", RUBA_REFERENCE_DIR);
  const available = new Set(await readdir(directory).catch(() => []));
  const configured = process.env.RUBA_REFERENCE_FILES?.split(",").map((file) => file.trim()).filter(Boolean);
  const selected = (configured?.length ? configured : DEFAULT_RUBA_REFERENCE_FILES).filter((file) => available.has(file));
  const limit = Number.parseInt(process.env.RUBA_REFERENCE_LIMIT || "3", 10);

  return selected.slice(0, Number.isFinite(limit) ? Math.max(0, Math.min(limit, 5)) : 3);
}

function getImageMimeType(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/png";
}

async function fetchImageAsBase64(imageUrl: string): Promise<ReferenceImage> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error("Could not fetch uploaded outfit image for Google generation.");
  }

  return {
    data: Buffer.from(await response.arrayBuffer()).toString("base64"),
    mimeType: response.headers.get("content-type") || "image/png"
  };
}

function parseGoogleResponse(text: string): GoogleInteractionResponse {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as GoogleInteractionResponse;
  } catch {
    throw new Error("Google image generation returned an invalid response.");
  }
}

function parseDeepAIResponse(text: string): DeepAIResponse {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as DeepAIResponse;
  } catch {
    throw new Error("DeepAI image generation returned an invalid response.");
  }
}

function findBase64Image(value: unknown): GoogleImageBlock | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.data === "string" && looksLikeBase64Image(record.data)) {
    return record as GoogleImageBlock;
  }

  for (const child of Object.values(record)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        const found = findBase64Image(item);
        if (found) return found;
      }
    } else {
      const found = findBase64Image(child);
      if (found) return found;
    }
  }

  return undefined;
}

function looksLikeBase64Image(value: string) {
  return value.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(value.slice(0, 256));
}

export async function editRubaImage(params: { imageUrl: string; prompt: string }) {
  const provider = getImageProvider();

  if (provider === "google") {
    const referenceImage = await fetchImageAsBase64(params.imageUrl);
    const image = await createGoogleImage(params.prompt, [referenceImage]);
    return uploadImageBuffer({
      buffer: base64ToBuffer(image.data),
      contentType: image.mimeType,
      folder: "edits"
    });
  }

  if (provider === "deepai") {
    throw new Error("DeepAI image edits are not supported in this app because the configured endpoint is text-to-image only.");
  }

  const response = await fetch(params.imageUrl);
  if (!response.ok) {
    throw new Error("Could not fetch source image for edit.");
  }

  const sourceBuffer = Buffer.from(await response.arrayBuffer());
  const file = new File([sourceBuffer], "source.png", { type: response.headers.get("content-type") || "image/png" });
  const client = getOpenAIClient();

  const edit = await client.images.edit({
    model: getImageModel(),
    image: file,
    prompt: params.prompt,
    size: "1024x1536",
    quality: "medium"
  });

  const b64 = edit.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("Image edit returned no image data.");
  }

  return uploadImageBuffer({
    buffer: base64ToBuffer(b64),
    contentType: "image/png",
    folder: "edits"
  });
}
