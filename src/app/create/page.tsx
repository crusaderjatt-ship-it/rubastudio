import { AppShell } from "@/components/app-shell/app-shell";
import { CreateStudio } from "@/components/create/create-studio";

export default function CreatePage() {
  return (
    <AppShell title="Create" subtitle="Upload a dress photo and generate a Ruba fashion post.">
      <CreateStudio />
    </AppShell>
  );
}
