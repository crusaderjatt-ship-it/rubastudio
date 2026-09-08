import { getOpenAIClient } from "@/lib/ai/openai";

export async function generateCaption(brief: string) {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 120,
    messages: [
      {
        role: "system",
        content: "Write one polished Instagram post for a Punjabi fashion brand. Include a short engaging caption, a gentle call to action, the website kesaribyshammirandhawa.com, and 8-10 relevant hashtags. The hashtag #kesaribyshammirandhawa is mandatory. Return only the ready-to-post content."
      },
      {
        role: "user",
        content: brief
      }
    ]
  });

  const generated = response.choices[0]?.message.content?.trim() || "Punjabi elegance, thoughtfully crafted for every celebration.";
  const withWebsite = generated.includes("kesaribyshammirandhawa.com")
    ? generated
    : `${generated}\n\nExplore the collection: kesaribyshammirandhawa.com`;

  return /#kesaribyshammirandhawa\b/i.test(withWebsite)
    ? withWebsite
    : `${withWebsite}\n\n#kesaribyshammirandhawa #PunjabiFashion #IndianWear #EthnicWear #TraditionalWear #PunjabiSuits #FashionInspiration #FestiveWear`;
}
