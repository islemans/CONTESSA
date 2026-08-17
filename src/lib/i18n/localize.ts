import type { Locale } from "./dictionaries";

/**
 * Categories carry an optional Arabic name from the dashboard. Use it when the
 * shop is being read in Arabic, and fall back to the Latin name whenever the
 * owner hasn't filled one in — a half-translated catalogue should degrade to
 * readable, not to blank.
 */
export function localizedName(
  item: { name: string; nameAr?: string | null },
  locale: Locale,
): string {
  if (locale === "ar" && item.nameAr && item.nameAr.trim()) return item.nameAr;
  return item.name;
}
