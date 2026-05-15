import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeWrapper from "@/components/ThemeWrapper";

export const metadata: Metadata = {
  title: "Accountable",
  description: "Modern habit tracking",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#C8B560",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <Providers>
          <ThemeWrapper>
            <div className="grain" />
            <main className="relative min-h-screen">
              {children}
            </main>
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}
