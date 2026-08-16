/**
 * URL-safe slug. Strips accents first so "Béjaïa" and "Prêt-à-porter" survive
 * as "bejaia" / "pret-a-porter" instead of collapsing into empty strings.
 */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Arabic-only names normalise to nothing — fall back to something stable.
  return slug || `item-${Math.random().toString(36).slice(2, 8)}`;
}
