"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Check, Copy, Download, Heart, Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/shared/button";
import type { GeneratedImage } from "@/types/ruba";

export function GalleryGrid({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [instagramContent, setInstagramContent] = useState("");
  const [isWritingPost, setIsWritingPost] = useState(false);
  const [postError, setPostError] = useState("");
  const [copied, setCopied] = useState(false);
  const wordCount = instruction.trim() ? instruction.trim().split(/\s+/).length : 0;

  async function generateInstagramPost() {
    if (!selectedImage || isWritingPost) return;
    setIsWritingPost(true);
    setPostError("");
    setCopied(false);
    try {
      const response = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: selectedImage.id })
      });
      const data = await response.json();
      if (!response.ok || !data.caption) throw new Error(data.error || "Could not generate Instagram content.");
      setInstagramContent(data.caption);
    } catch (error) {
      setPostError(error instanceof Error ? error.message : "Could not generate Instagram content.");
    } finally {
      setIsWritingPost(false);
    }
  }

  async function copyInstagramPost() {
    if (!instagramContent) return;
    await navigator.clipboard.writeText(instagramContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function applyMinorEdit() {
    if (!selectedImage || isEditing || !wordCount || wordCount > 50) return;
    setIsEditing(true);
    setEditError("");
    setEditStatus("");
    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: selectedImage.id, instruction: instruction.trim() })
      });
      const data = await response.json();
      if (!response.ok || !data.image) throw new Error(data.error || "Could not edit image. Please try again.");
      const edited = data.image as GeneratedImage;
      if (!favoritesOnly || edited.is_favorite) setImages((current) => [edited, ...current]);
      setSelectedImage(edited);
      setInstruction("");
      setEditStatus("Edited copy saved to the gallery. Your original is preserved.");
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Could not edit image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  }

  async function downloadImage(image: GeneratedImage) {
    setDownloadingId(image.id);
    setDownloadError("");
    try {
      const response = await fetch(image.image_url);
      if (!response.ok) throw new Error("Could not download image. Please try again.");
      const blob = await response.blob();
      const extension = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ruba-${image.id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setDownloadError("Could not download image. Please check your connection and try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  useEffect(() => {
    fetch(`/api/gallery${favoritesOnly ? "?favorites=true" : ""}`)
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error || "Could not load images.");
          return;
        }
        setImages(data.images || []);
      })
      .catch(() => setError("Could not load images."))
      .finally(() => setIsLoading(false));
  }, [favoritesOnly]);

  async function toggleFavorite(image: GeneratedImage) {
    const response = await fetch(`/api/gallery/${image.id}/favorite`, { method: "POST" });
    const data = await response.json();
    if (response.ok) {
      setImages((current) =>
        favoritesOnly
          ? current.filter((item) => item.id !== image.id)
          : current.map((item) => (item.id === image.id ? data.image : item))
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-gold/20 bg-white/82">
        <Loader2 className="animate-spin text-gold" />
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg bg-blush px-3 py-2 text-sm font-semibold text-maroon">{error}</p>;
  }

  if (!images.length) {
    return (
      <div className="rounded-lg border border-gold/20 bg-white/82 p-6 text-center shadow-soft">
        <p className="font-display text-2xl font-bold text-charcoal">{favoritesOnly ? "No favorites yet" : "No images yet"}</p>
        <p className="mt-1 text-sm text-charcoal/65">Generate a look from the Create tab.</p>
      </div>
    );
  }

  if (selectedImage) {
    return (
      <section aria-label="Image preview" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" disabled={isEditing} onClick={() => setSelectedImage(null)}>
            <ArrowLeft size={16} /> Back to {favoritesOnly ? "favorites" : "gallery"}
          </Button>
          <Button onClick={() => downloadImage(selectedImage)} disabled={downloadingId !== null}>
            {downloadingId ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download
          </Button>
        </div>
        {downloadError && <p role="alert" className="text-sm text-maroon">{downloadError}</p>}
        <Image src={selectedImage.image_url} alt="Ruba Studio generated look, full image" width={1200} height={1800} unoptimized className="h-auto max-h-[80vh] w-full rounded-lg object-contain" />
        <form className="space-y-3 rounded-lg border border-gold/20 bg-white/82 p-4" onSubmit={(event) => { event.preventDefault(); void applyMinorEdit(); }}>
          <label htmlFor="gallery-minor-edit" className="block text-sm font-bold">Minor tweak</label>
          <textarea id="gallery-minor-edit" value={instruction} disabled={isEditing} maxLength={600} onChange={(event) => setInstruction(event.target.value)} placeholder="e.g. Make the smile softer or brighten the lighting slightly" className="min-h-24 w-full rounded-lg border border-gold/30 bg-ivory p-3 text-sm" />
          <p className="text-xs text-charcoal/65">{wordCount}/50 words. Saves a new image and keeps the original.</p>
          <Button type="submit" disabled={isEditing || wordCount === 0 || wordCount > 50}>
            {isEditing && <Loader2 size={16} className="animate-spin" />}
            {isEditing ? "Applying tweak..." : "Apply tweak"}
          </Button>
          {editError && <p role="alert" className="text-sm text-maroon">{editError}</p>}
          <p role="status" className="text-sm text-charcoal/70">{editStatus}</p>
        </form>
        <section className="space-y-3 rounded-lg border border-gold/20 bg-white/82 p-4" aria-labelledby="instagram-post-title">
          <div>
            <h2 id="instagram-post-title" className="flex items-center gap-2 text-sm font-bold"><Instagram size={18} /> Instagram post content</h2>
            <p className="mt-1 text-xs text-charcoal/65">Creates a ready-to-post caption with relevant hashtags and your website link.</p>
          </div>
          <Button type="button" variant="secondary" className="w-full" onClick={generateInstagramPost} disabled={isWritingPost}>
            {isWritingPost ? <Loader2 size={16} className="animate-spin" /> : <Instagram size={16} />}
            {isWritingPost ? "Writing post..." : instagramContent ? "Generate new version" : "Generate Instagram post"}
          </Button>
          {instagramContent ? (
            <>
              <textarea aria-label="Instagram post content" value={instagramContent} onChange={(event) => { setInstagramContent(event.target.value); setCopied(false); }} className="min-h-52 w-full rounded-lg border border-gold/30 bg-ivory p-3 text-sm" />
              <Button type="button" className="w-full" onClick={copyInstagramPost}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy post content"}
              </Button>
            </>
          ) : null}
          {postError ? <p role="alert" className="text-sm text-maroon">{postError}</p> : null}
        </section>
      </section>
    );
  }

  return (
    <div className="space-y-3">
    {downloadError && <p role="alert" className="text-sm text-maroon">{downloadError}</p>}
    <div className="grid grid-cols-2 gap-3">
      {images.map((image) => (
        <article key={image.id} className="overflow-hidden rounded-lg border border-gold/20 bg-white shadow-soft">
          <button type="button" aria-label="Open full image" className="block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon" onClick={() => { setSelectedImage(image); setInstruction(""); setEditError(""); setEditStatus(""); setInstagramContent(""); setPostError(""); setCopied(false); }}>
            <Image src={image.thumbnail_url || image.image_url} alt="Ruba Studio generated look" width={260} height={390} className="aspect-[2/3] w-full object-cover" />
          </button>
          <div className="grid grid-cols-2 gap-1 p-2">
            <Button variant="ghost" onClick={() => toggleFavorite(image)} className="px-2">
              <Heart size={16} /> {image.is_favorite ? "Saved" : "Save"}
            </Button>
            <Button variant="ghost" className="px-2" onClick={() => downloadImage(image)} disabled={downloadingId !== null}>
              {downloadingId === image.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Get
            </Button>
          </div>
        </article>
      ))}
    </div>
    </div>
  );
}
