import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Heart, Images, Settings } from "lucide-react";

const navItems = [
  { href: "/create", label: "Create", icon: Camera },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Ruba Studio</p>
          <h1 className="font-display text-3xl font-bold text-charcoal">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-charcoal/70">{subtitle}</p> : null}
        </div>
        <Image
          src="/ruba-kaur-mugshot.png"
          alt="Ruba Kaur"
          width={56}
          height={56}
          className="h-14 w-14 rounded-full border-2 border-white object-cover object-top shadow-soft"
          priority
        />
      </header>
      <div className="flex-1">{children}</div>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-gold/20 bg-ivory/95 px-3 pt-2 backdrop-blur">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold text-charcoal/70 hover:bg-white hover:text-maroon"
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
