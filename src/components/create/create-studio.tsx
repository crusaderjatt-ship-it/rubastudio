"use client";

import { ChangeEvent, useMemo, useState } from "react";
import Image from "next/image";
import { Download, Heart, Loader2, Share2, WandSparkles } from "lucide-react";
import { Button } from "@/components/shared/button";
import type { AspectRatioOption, BackdropOption, DressTypeOption, ExpressionOption, FootwearOption, GeneratedImage, PoseOption } from "@/types/ruba";

const poses: Array<PoseOption | "other"> = ["standing", "walking", "smiling", "hand under chin", "looking back", "other"];
const backdrops: Array<BackdropOption | "other"> = ["Chandigarh garden", "brick wall", "street", "courtyard", "studio", "other"];
const expressions: Array<ExpressionOption | "other"> = ["charming smile", "soft smile", "confident", "looking away", "other"];
const footwear: Array<FootwearOption | "other"> = ["match outfit", "white footwear", "juttis", "heels", "other"];
const dressTypes: Array<{ value: DressTypeOption; label: string }> = [
  { value: "auto", label: "Auto from upload" },
  { value: "salwar kameez", label: "Salwar kameez" },
  { value: "patiala suit", label: "Patiala suit" },
  { value: "palazzo suit", label: "Palazzo suit" },
  { value: "straight salwar suit", label: "Straight salwar suit" },
  { value: "anarkali suit", label: "Anarkali suit" },
  { value: "sharara suit", label: "Sharara suit" },
  { value: "gharara suit", label: "Gharara suit" },
  { value: "churidar suit", label: "Churidar suit" },
  { value: "punjabi suit with dupatta", label: "Punjabi suit with dupatta" },
  { value: "kurti with jeans", label: "Kurti with jeans" },
  { value: "kurti with palazzo", label: "Kurti with palazzo" },
  { value: "lehenga suit", label: "Lehenga suit" },
  { value: "co-ord set", label: "Co-ord set" },
  { value: "maxi dress", label: "Maxi dress" },
  { value: "midi dress", label: "Midi dress" },
  { value: "western dress", label: "Western dress" },
  { value: "jumpsuit", label: "Jumpsuit" },
  { value: "blazer suit", label: "Blazer suit" },
  { value: "shirt and trousers", label: "Shirt and trousers" },
  { value: "skirt and top", label: "Skirt and top" },
  { value: "jeans and top", label: "Jeans and top" },
  { value: "other", label: "Other" }
];
const aspectRatios: Array<{ value: AspectRatioOption; label: string; note: string }> = [
  { value: "4:5", label: "4:5", note: "Instagram post" },
  { value: "9:16", label: "9:16", note: "Story/Reel" },
  { value: "1:1", label: "1:1", note: "Square" },
  { value: "3:4", label: "3:4", note: "Portrait" }
];

const quickEdits = [
  { action: "smile", label: "Smile more" },
  { action: "fullBody", label: "Full body" },
  { action: "footwear", label: "White footwear" },
  { action: "background", label: "Better backdrop" },
  { action: "sameFace", label: "Same face" }
];

type Outfit = {
  id: string;
  name: string | null;
  image_urls: string[];
  ai_analysis_json: unknown;
};

export function CreateStudio() {
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [caption, setCaption] = useState("");
  const [pose, setPose] = useState<PoseOption | "other">("walking");
  const [backdrop, setBackdrop] = useState<BackdropOption | "other">("Chandigarh garden");
  const [expression, setExpression] = useState<ExpressionOption | "other">("charming smile");
  const [shoe, setShoe] = useState<FootwearOption | "other">("match outfit");
  const [dressType, setDressType] = useState<DressTypeOption>("auto");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("4:5");
  const [customPose, setCustomPose] = useState("");
  const [customBackdrop, setCustomBackdrop] = useState("");
  const [customExpression, setCustomExpression] = useState("");
  const [customFootwear, setCustomFootwear] = useState("");
  const [customDressType, setCustomDressType] = useState("");
  const [editInstruction, setEditInstruction] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const previewUrl = useMemo(() => outfit?.image_urls?.[0], [outfit]);

  async function uploadOutfit(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    setIsBusy(true);
    setError("");
    setStatus("Uploading outfit photo...");

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/outfits", { method: "POST", body: formData });
    const data = await readApiResponse<{ outfit?: Outfit; error?: string }>(response);

    setIsBusy(false);

    if (!response.ok || !data.outfit) {
      setError(data.error || "Could not upload outfit.");
      setStatus("");
      return;
    }

    setOutfit(data.outfit);
    setStatus("Outfit ready. Choose the look, then press Generate.");
  }

  async function generateImages() {
    if (!outfit) return;

    setIsBusy(true);
    setError("");
    setCaption("");
    setStatus("Analyzing outfit and generating 1 image...");

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outfitId: outfit.id,
        pose,
        backdrop,
        expression,
        footwear: shoe,
        customPose,
        customBackdrop,
        customExpression,
        customFootwear,
        dressType,
        customDressType,
        aspectRatio,
        count: 1
      })
    });
    const data = await readApiResponse<{ images?: GeneratedImage[]; error?: string }>(response);

    setIsBusy(false);

    if (!response.ok || !data.images) {
      setError(data.error || "Could not generate images.");
      setStatus("");
      return;
    }

    setImages(data.images);
    setSelectedImage(data.images[0] || null);
    setStatus("Pick the favorite result.");
  }

  async function toggleFavorite(image: GeneratedImage) {
    const response = await fetch(`/api/gallery/${image.id}/favorite`, { method: "POST" });
    const data = await readApiResponse<{ image?: GeneratedImage; error?: string }>(response);
    if (response.ok && data.image) {
      const updatedImage = data.image;
      setImages((current) => current.map((item) => (item.id === image.id ? updatedImage : item)));
      setSelectedImage(updatedImage);
    }
  }

  async function editImage(action?: string, instruction?: string) {
    if (!selectedImage) return;

    setIsBusy(true);
    setError("");
    setStatus("Applying quick edit...");

    const response = await fetch("/api/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId: selectedImage.id, action, instruction })
    });
    const data = await readApiResponse<{ image?: GeneratedImage; error?: string }>(response);

    setIsBusy(false);

    if (!response.ok || !data.image) {
      setError(data.error || "Could not edit image.");
      setStatus("");
      return;
    }

    const editedImage = data.image;
    setImages((current) => [editedImage, ...current]);
    setSelectedImage(editedImage);
    setEditInstruction("");
    setStatus("Edited image added.");
  }

  async function createCaption() {
    if (!selectedImage) return;

    setIsBusy(true);
    setStatus("Writing caption and hashtags...");

    const response = await fetch("/api/caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId: selectedImage.id })
    });
    const data = await readApiResponse<{ caption?: string; error?: string }>(response);
    setIsBusy(false);

    if (!response.ok || !data.caption) {
      setError(data.error || "Could not generate caption.");
      setStatus("");
      return;
    }

    setCaption(data.caption);
    setStatus("Ready to share.");
  }

  async function shareFinal() {
    if (!selectedImage) return;
    if (navigator.share) {
      await navigator.share({
        title: "Ruba Studio",
        text: caption || "Ruba Studio fashion look",
        url: selectedImage.image_url
      });
      return;
    }
    await navigator.clipboard.writeText(`${caption}\n${selectedImage.image_url}`.trim());
    setStatus("Caption and image link copied.");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-gold/20 bg-white/82 p-4 shadow-soft">
        <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gold/50 bg-ivory text-center">
          {previewUrl ? (
            <>
              <Image src={previewUrl} alt="Uploaded outfit" width={320} height={420} className="max-h-64 w-auto rounded-lg object-contain" />
              <span className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-bold text-maroon">Change outfit photo</span>
            </>
          ) : (
            <>
              <WandSparkles className="mb-3 text-gold" size={30} />
              <span className="text-base font-bold text-charcoal">Upload outfit photo</span>
              <span className="mt-1 text-sm text-charcoal/65">Camera or gallery</span>
            </>
          )}
          <input className="hidden" type="file" accept="image/*" onChange={uploadOutfit} />
        </label>
      </section>

      <section className="space-y-4 rounded-lg border border-gold/20 bg-white/82 p-4 shadow-soft">
        <DressTypeSelect value={dressType} onChange={setDressType} customValue={customDressType} onCustomChange={setCustomDressType} />
        <ChipGroup title="Pose" options={poses} value={pose} onChange={setPose} customValue={customPose} onCustomChange={setCustomPose} customPlaceholder="e.g. twirling lightly" />
        <ChipGroup title="Backdrop" options={backdrops} value={backdrop} onChange={setBackdrop} customValue={customBackdrop} onCustomChange={setCustomBackdrop} customPlaceholder="e.g. sunny terrace" />
        <ChipGroup title="Expression" options={expressions} value={expression} onChange={setExpression} customValue={customExpression} onCustomChange={setCustomExpression} customPlaceholder="e.g. shy smile" />
        <ChipGroup title="Footwear" options={footwear} value={shoe} onChange={setShoe} customValue={customFootwear} onCustomChange={setCustomFootwear} customPlaceholder="e.g. beige heels" />
        <AspectRatioGroup value={aspectRatio} onChange={setAspectRatio} />
        <Button onClick={generateImages} disabled={!outfit || isBusy} className="w-full">
          {isBusy ? <Loader2 className="animate-spin" size={18} /> : <WandSparkles size={18} />}
          Generate 1 image
        </Button>
      </section>

      {status ? <p className="rounded-lg bg-gold/12 px-3 py-2 text-sm font-semibold text-charcoal">{status}</p> : null}
      {error ? <p className="rounded-lg bg-blush px-3 py-2 text-sm font-semibold text-maroon">{error}</p> : null}

      {images.length ? (
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className={`overflow-hidden rounded-lg border bg-white ${selectedImage?.id === image.id ? "border-maroon" : "border-gold/20"}`}
              >
                <Image src={image.thumbnail_url || image.image_url} alt="Generated Ruba look" width={240} height={360} className="aspect-[2/3] w-full object-cover" />
              </button>
            ))}
          </div>

          {selectedImage ? (
            <div className="space-y-3 rounded-lg border border-gold/20 bg-white/82 p-4 shadow-soft">
              <Image src={selectedImage.image_url} alt="Selected Ruba look" width={420} height={630} className="aspect-[2/3] w-full rounded-lg object-cover" />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => toggleFavorite(selectedImage)}>
                  <Heart size={17} /> {selectedImage.is_favorite ? "Favorited" : "Favorite"}
                </Button>
                <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gold/30 bg-white px-4 py-2 text-sm font-semibold text-charcoal" href={selectedImage.image_url} download>
                  <Download size={17} /> Download
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickEdits.map((edit) => (
                  <Button key={edit.action} variant="ghost" onClick={() => editImage(edit.action)} disabled={isBusy}>
                    {edit.label}
                  </Button>
                ))}
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-charcoal" htmlFor="minor-edit">
                  Minor edit prompt
                </label>
                <textarea
                  id="minor-edit"
                  className="min-h-24 w-full rounded-lg border border-gold/30 bg-ivory p-3 text-sm outline-none focus:border-maroon"
                  value={editInstruction}
                  onChange={(event) => setEditInstruction(limitWords(event.target.value, 50))}
                  placeholder="Example: make the smile softer and improve lighting, keep outfit and face same"
                />
                <div className="mt-1 flex items-center justify-between gap-3 text-xs font-medium text-charcoal/55">
                  <span>Minor photo tweaks only. Identity, outfit, body, and scene are locked.</span>
                  <span>{countWords(editInstruction)}/50</span>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => editImage(undefined, editInstruction)}
                  disabled={isBusy || !editInstruction.trim()}
                  className="mt-2 w-full"
                >
                  Apply minor edit
                </Button>
              </div>
              <Button variant="secondary" onClick={createCaption} disabled={isBusy} className="w-full">
                Generate caption
              </Button>
              {caption ? <textarea className="min-h-28 w-full rounded-lg border border-gold/30 bg-ivory p-3 text-sm outline-none" value={caption} onChange={(event) => setCaption(event.target.value)} /> : null}
              <Button onClick={shareFinal} disabled={!selectedImage} className="w-full">
                <Share2 size={17} /> Share final
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function limitWords(value: string, maxWords: number) {
  return value.split(/\s+/).filter(Boolean).slice(0, maxWords).join(" ");
}

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

async function readApiResponse<T extends { error?: string }>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return { error: response.ok ? "" : "The server returned an empty response." } as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: response.ok ? "The server returned an invalid response." : "The server returned an error page instead of JSON." } as T;
  }
}

function DressTypeSelect({
  value,
  onChange,
  customValue,
  onCustomChange
}: {
  value: DressTypeOption;
  onChange: (value: DressTypeOption) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-charcoal" htmlFor="dress-type">
        Dress type
      </label>
      <select
        id="dress-type"
        value={value}
        onChange={(event) => onChange(event.target.value as DressTypeOption)}
        className="min-h-11 w-full rounded-lg border border-gold/30 bg-ivory px-3 text-sm font-semibold text-charcoal outline-none focus:border-maroon"
      >
        {dressTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      {value === "other" ? (
        <div className="mt-2">
          <input
            value={customValue}
            onChange={(event) => onCustomChange(event.target.value.slice(0, 80))}
            className="min-h-11 w-full rounded-lg border border-gold/30 bg-ivory px-3 text-sm outline-none focus:border-maroon"
            placeholder="e.g. short kurti with cigarette pants"
            maxLength={80}
          />
          <p className="mt-1 text-xs font-medium text-charcoal/55">Short outfit type only, max 80 characters.</p>
        </div>
      ) : (
        <p className="mt-1 text-xs font-medium text-charcoal/55">Auto keeps the uploaded outfit shape; other choices guide the silhouette.</p>
      )}
    </div>
  );
}

function AspectRatioGroup({ value, onChange }: { value: AspectRatioOption; onChange: (value: AspectRatioOption) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-charcoal">Aspect ratio</p>
      <div className="grid grid-cols-2 gap-2">
        {aspectRatios.map((ratio) => (
          <button
            key={ratio.value}
            onClick={() => onChange(ratio.value)}
            className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
              value === ratio.value ? "border-maroon bg-maroon text-white" : "border-gold/30 bg-ivory text-charcoal"
            }`}
            type="button"
          >
            <span className="block">{ratio.label}</span>
            <span className={`text-xs ${value === ratio.value ? "text-white/75" : "text-charcoal/55"}`}>{ratio.note}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChipGroup<T extends string>({
  title,
  options,
  value,
  onChange,
  customValue,
  onCustomChange,
  customPlaceholder
}: {
  title: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
  customPlaceholder: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-charcoal">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              value === option ? "border-maroon bg-maroon text-white" : "border-gold/30 bg-ivory text-charcoal"
            }`}
            type="button"
          >
            {option === "other" ? "Other" : option}
          </button>
        ))}
      </div>
      {value === "other" ? (
        <div className="mt-2">
          <input
            value={customValue}
            onChange={(event) => onCustomChange(event.target.value.slice(0, 80))}
            className="min-h-11 w-full rounded-lg border border-gold/30 bg-ivory px-3 text-sm outline-none focus:border-maroon"
            placeholder={customPlaceholder}
            maxLength={80}
          />
          <p className="mt-1 text-xs font-medium text-charcoal/55">Short fashion-safe note only, max 80 characters.</p>
        </div>
      ) : null}
    </div>
  );
}
