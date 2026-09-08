import type { AspectRatioOption, BackdropOption, ExpressionOption, FootwearOption, OutfitAnalysis, PoseOption } from "@/types/ruba";

export function buildRubaPrompt(input: {
  analysis: OutfitAnalysis;
  pose: PoseOption | string;
  backdrop: BackdropOption | string;
  expression: ExpressionOption | string;
  footwear: FootwearOption | string;
  dressType: string;
  aspectRatio: AspectRatioOption;
  editInstruction?: string;
}) {
  const outfit = [
    `Garment type: ${input.analysis.garmentType}`,
    `Colors: ${input.analysis.colors.join(", ") || "match uploaded outfit"}`,
    input.analysis.neckline ? `Neckline: ${input.analysis.neckline}` : "",
    input.analysis.sleeves ? `Sleeves: ${input.analysis.sleeves}` : "",
    input.analysis.bottomType ? `Bottom type: ${input.analysis.bottomType}` : "",
    input.analysis.dupatta ? `Dupatta: ${input.analysis.dupatta}` : "",
    input.analysis.patterns?.length ? `Patterns: ${input.analysis.patterns.join(", ")}` : "",
    input.analysis.notes.length ? `Notes: ${input.analysis.notes.join("; ")}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return `Photoreal Punjabi fashion photo for Ruba Studio, ${input.aspectRatio} crop.
Use Ruba reference images for identity only; use uploaded outfit image for clothing only.
Ruba identity lock: 5'7" Punjabi woman, slim hourglass, defined waist, slightly fuller bust, slim arms/hands/legs, warm fair wheatish skin, oval-heart face, sharp soft features, almond eyes, slender nose, long thick black hair, bright natural smile with beautiful teeth.
Outfit lock: keep uploaded color, print, border, fabric feel, and key details.
Photo quality: crisp natural fabric weave and embroidery, realistic skin pores and individual hair strands, anatomically correct hands and feet, coherent eyes and teeth, physically consistent lighting and shadows. No fused fingers, warped limbs, melted jewelry, repeated textures, waxy skin, oversharpening halos or artificial blur. Preserve natural detail rather than beauty-filter smoothing.
Dress type: ${input.dressType}; if auto, match uploaded silhouette; otherwise adapt silhouette to this type without changing fabric/color/details.
Outfit notes: ${outfit}
Look: ${input.pose}; ${input.backdrop}; ${input.expression}; footwear: ${input.footwear}. Full body, fit model in frame for ${input.aspectRatio}, natural daylight, premium editorial, minimal tasteful Punjabi jewelry.
Avoid: different face/body, petite/straight body, broad face, heavy jaw, stern/older look, heavy bridal styling unless asked, extra fingers, plastic skin, signs/text, wrong pants/salwar.
${input.editInstruction ? `Edit: ${input.editInstruction}` : ""}`;
}

export function buildCaptionBrief(promptText: string) {
  const lookMatch = promptText.match(/Look: ([^.]+)\./);
  const outfitMatch = promptText.match(/Outfit notes: ([\s\S]*?)\nLook:/);

  return [
    lookMatch ? `Look: ${lookMatch[1]}` : "Punjabi fashion look",
    outfitMatch ? `Outfit: ${outfitMatch[1].replace(/\s+/g, " ").slice(0, 220)}` : "Outfit from uploaded dress reference"
  ].join("\n");
}

export function buildMinorEditPrompt(instruction: string) {
  return `Minor realistic photo edit only: ${instruction}.
Keep Ruba's face, body, outfit, pose, framing, and overall scene unchanged unless the edit asks for a tiny adjustment.
Do not redesign clothes, add text/logos, change identity, add people, or alter body shape. Preserve photorealism, natural skin texture, crisp fabric detail, correct anatomy and consistent shadows. Avoid fused fingers, warped jewelry, waxy skin and sharpening halos.`;
}
