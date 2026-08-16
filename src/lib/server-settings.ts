import "server-only";
import { fetchQuery } from "convex/nextjs";
import { api } from "@cvx/_generated/api";
import { DEFAULT_SETTINGS } from "@cvx/lib/defaults";
import type { SiteSettings } from "./theme-css";

/**
 * Reads settings during SSR so the first paint already carries the owner's
 * theme — no flash of the default palette.
 *
 * Falls back to the built-in defaults whenever Convex isn't reachable (before
 * `npx convex dev` has ever run, or during a CI build with no env vars), which
 * keeps `next build` working on a fresh clone.
 */
export async function getSettings(): Promise<SiteSettings> {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return DEFAULT_SETTINGS;

  try {
    const settings = await fetchQuery(api.settings.get, {});
    return (settings as SiteSettings) ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
