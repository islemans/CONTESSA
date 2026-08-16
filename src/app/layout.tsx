import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import { getSettings } from "@/lib/server-settings";
import { themeCss } from "@/lib/theme-css";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

/**
 * Absolute base for OG images. Vercel injects VERCEL_PROJECT_PRODUCTION_URL on
 * every deployment, so this resolves correctly in preview and production
 * without hard-coding the domain.
 */
function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL("http://localhost:3000");
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: siteUrl(),
    title: {
      default: `${settings.siteName} — ${settings.tagline}`,
      template: `%s · ${settings.siteName}`,
    },
    description:
      "Maison de beauté et de mode féminine. Maquillage et vêtements sélectionnés avec soin, livrés partout en Algérie.",
    icons: { icon: "/brand/logo-light.jpg", apple: "/brand/logo-light.jpg" },
    openGraph: {
      title: `${settings.siteName} — ${settings.tagline}`,
      type: "website",
      images: ["/brand/logo-light.jpg"],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays available; the shop must not fight assistive zoom.
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0908" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${cormorant.variable} ${outfit.variable}`}
    >
      <head>
        {/* Painted before first frame, so the owner's palette never flashes. */}
        <style
          id="contessa-theme-ssr"
          dangerouslySetInnerHTML={{ __html: themeCss(settings.theme) }}
        />
      </head>
      <body className="min-h-dvh bg-bg text-ink antialiased">
        <Providers defaultMode={settings.theme.defaultMode}>{children}</Providers>
      </body>
    </html>
  );
}
