import type { DressTypeOption } from "@/types/ruba";

const MAX_CUSTOM_OPTION_LENGTH = 80;
const MAX_EDIT_WORDS = 50;
const dressTypes = new Set<DressTypeOption>([
  "auto",
  "salwar kameez",
  "patiala suit",
  "palazzo suit",
  "straight salwar suit",
  "anarkali suit",
  "sharara suit",
  "gharara suit",
  "churidar suit",
  "punjabi suit with dupatta",
  "kurti with jeans",
  "kurti with palazzo",
  "lehenga suit",
  "co-ord set",
  "maxi dress",
  "midi dress",
  "western dress",
  "jumpsuit",
  "blazer suit",
  "shirt and trousers",
  "skirt and top",
  "jeans and top",
  "other"
]);
const blockedFragments = [
  "ignore previous",
  "system prompt",
  "developer",
  "policy",
  "nsfw",
  "nude",
  "sexual",
  "child",
  "violence",
  "gore",
  "celebrity",
  "different person",
  "change identity"
];

export function resolveOption<T extends string>(params: {
  selected: T | "other";
  custom?: string;
  fallback: T;
  label: "pose" | "backdrop" | "expression" | "footwear";
}) {
  if (params.selected !== "other") {
    return params.selected;
  }

  const cleaned = cleanCustomOption(params.custom || "");
  if (!cleaned) {
    return params.fallback;
  }

  return `custom ${params.label}: ${cleaned}` as const;
}

export function cleanCustomOption(value: string) {
  const normalized = value
    .replace(/[^\w\s.,'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CUSTOM_OPTION_LENGTH);

  const lowered = normalized.toLowerCase();
  if (blockedFragments.some((fragment) => lowered.includes(fragment))) {
    return "";
  }

  return normalized;
}

export function clampImageCount(count: number) {
  if (!Number.isFinite(count)) return 1;
  return Math.min(Math.max(Math.floor(count), 1), 4);
}

export function resolveAspectRatio(value: unknown) {
  if (value === "9:16" || value === "1:1" || value === "3:4") {
    return value;
  }

  return "4:5";
}

export function resolveDressType(selected: unknown, custom?: string) {
  if (selected === "other") {
    const cleaned = cleanCustomOption(custom || "");
    return cleaned ? `custom dress type: ${cleaned}` : "auto from uploaded outfit";
  }

  if (typeof selected === "string" && dressTypes.has(selected as DressTypeOption) && selected !== "auto") {
    return selected;
  }

  return "auto from uploaded outfit";
}

export function cleanMinorEditInstruction(value: string) {
  const normalized = value
    .replace(/[^\w\s.,'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = normalized.split(/\s+/).filter(Boolean).slice(0, MAX_EDIT_WORDS);
  const cleaned = words.join(" ");
  const lowered = cleaned.toLowerCase();

  if (!cleaned || blockedFragments.some((fragment) => lowered.includes(fragment))) {
    return "";
  }

  return cleaned;
}
