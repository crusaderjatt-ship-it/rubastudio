import { AppShell } from "@/components/app-shell/app-shell";
import { LogoutButton } from "@/components/shared/logout-button";
import { ProviderSettingsForm } from "@/components/settings/provider-settings-form";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Private studio configuration.">
      <div className="space-y-4">
        <section className="rounded-lg border border-gold/20 bg-white/82 p-4 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-charcoal">Defaults</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-semibold text-charcoal/70">Model</dt>
              <dd className="font-bold text-charcoal">Ruba</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-semibold text-charcoal/70">Aspect ratio</dt>
              <dd className="font-bold text-charcoal">9:16</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-semibold text-charcoal/70">Image model</dt>
              <dd className="font-bold text-charcoal">Gemini</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-semibold text-charcoal/70">Storage</dt>
              <dd className="font-bold text-charcoal">Supabase</dd>
            </div>
          </dl>
        </section>

        <ProviderSettingsForm />

        <LogoutButton />
      </div>
    </AppShell>
  );
}
