import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/shared/pwa-register";

export const metadata: Metadata = {
  title: "Ruba Studio",
  description: "Private fashion image studio for Instagram-ready Ruba looks.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Ruba Studio",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#c69b52"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
