import type { OutfitAnalysis } from "@/types/ruba";
import { getOpenAIClient } from "@/lib/ai/openai";
import { getImageProvider } from "@/lib/ai/provider";

const fallbackAnalysis: OutfitAnalysis = {
  garmentType: "Punjabi outfit",
  colors: ["match uploaded outfit"],
  notes: ["Use uploaded image as the visual source of truth."]
};

export async function analyzeOutfitFromUrl(imageUrl: string): Promise<OutfitAnalysis> {
  if (getImageProvider() === "google") {
    return fallbackAnalysis;
  }

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You analyze Punjabi fashion outfit images. Return compact JSON with garmentType, colors, neckline, sleeves, bottomType, dupatta, patterns, notes. Never guess details that are not visible."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this outfit for faithful image generation." },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ]
    });

    const content = response.choices[0]?.message.content;
    if (!content) return fallbackAnalysis;
    return { ...fallbackAnalysis, ...JSON.parse(content) } as OutfitAnalysis;
  } catch {
    return fallbackAnalysis;
  }
}
