import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SCUDO ITALIA — rete grandine in tempo reale",
  description: "Mappa 3D Italia, meteo live, webcam e allerte push.",
  applicationName: "SCUDO ITALIA",
  manifest: "/manifest.json",
};
export const viewport: Viewport = { themeColor: "#050505", width: "device-width", initialScale: 1, maximumScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
