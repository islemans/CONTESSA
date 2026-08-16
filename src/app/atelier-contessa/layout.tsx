import type { Metadata } from "next";
import { AdminSessionProvider } from "@/lib/admin-session";

/**
 * The door is only hidden if nothing points at it: no nav link, no sitemap
 * entry, and an explicit noindex so a crawler that stumbles in never publishes
 * the address.
 */
export const metadata: Metadata = {
  title: "Atelier",
  robots: { index: false, follow: false, nocache: true },
};

export default function AtelierLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminSessionProvider>{children}</AdminSessionProvider>;
}
