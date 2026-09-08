import { AppShell } from "@/components/app-shell/app-shell";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export default function FavoritesPage() {
  return (
    <AppShell title="Favorites" subtitle="The strongest final images.">
      <GalleryGrid favoritesOnly />
    </AppShell>
  );
}
