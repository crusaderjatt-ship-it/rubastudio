import { AppShell } from "@/components/app-shell/app-shell";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export default function GalleryPage() {
  return (
    <AppShell title="Gallery" subtitle="All generated looks in one place.">
      <GalleryGrid />
    </AppShell>
  );
}
