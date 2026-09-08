import { getOpenAIClient } from "@/lib/ai/openai";

export async function generateCaption(brief: string) {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 120,
    messages: [
      {
        role: "system",
        content: "Write one short elegant Instagram caption for Punjabi fashion. Add 8-10 hashtags. No extra options."
      },
      {
        role: "user",
        content: brief
      }
    ]
  });

  return response.choices[0]?.message.content?.trim() || "Punjabi elegance, softly captured.\n\n#RubaStudio #PunjabiFashion";
}
