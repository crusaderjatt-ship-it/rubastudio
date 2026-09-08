export type ImageProvider = "openai" | "google" | "deepai";

export function getImageProvider(override?: string): ImageProvider {
  if (override === "google" || override === "deepai" || override === "openai") {
    return override;
  }

  if (!process.env.IMAGE_PROVIDER) {
    return "google";
  }

  if (process.env.IMAGE_PROVIDER === "deepai") {
    return "deepai";
  }

  if (process.env.IMAGE_PROVIDER === "openai") {
    return "openai";
  }

  return "google";
}

export function getGoogleImageModel() {
  const model = process.env.GOOGLE_IMAGE_MODEL;
  // Migrate the former 1K-only default to the native 4K model.
  return !model || model === "gemini-3.1-flash-lite-image" ? "gemini-3.1-flash-image" : model;
}

export function getGoogleApiKey() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured.");
  }

  return apiKey;
}

export function getDeepAIApiKey() {
  const apiKey = process.env.DEEPAI_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPAI_API_KEY is not configured.");
  }

  return apiKey;
}

export function getDeepAIImageVersion() {
  return process.env.DEEPAI_IMAGE_VERSION || "standard";
}
