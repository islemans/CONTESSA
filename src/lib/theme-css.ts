import { DEFAULT_SETTINGS } from "@cvx/lib/defaults";

export type ThemeTokens = typeof DEFAULT_SETTINGS.theme.light;
export type ThemeConfig = typeof DEFAULT_SETTINGS.theme;
export type SiteSettings = typeof DEFAULT_SETTINGS;

export const TOKEN_LABELS: { key: keyof ThemeTokens; label: string; hint: string }[] = [
  { key: "bg", label: "Background", hint: "Page canvas" },
  { key: "surface", label: "Surface", hint: "Cards, bars, sheets" },
  { key: "ink", label: "Text", hint: "Headings and body copy" },
  { key: "muted", label: "Muted text", hint: "Captions and hints" },
  { key: "accent", label: "Accent", hint: "Buttons and links" },
  { key: "accentInk", label: "On accent", hint: "Text on accent fills" },
  { key: "gold", label: "Gold", hint: "Rules, badges, shimmer" },
  { key: "border", label: "Border", hint: "Hairlines and dividers" },
];

function block(tokens: ThemeTokens): string {
  return [
    `--c-bg:${tokens.bg}`,
    `--c-surface:${tokens.surface}`,
    `--c-ink:${tokens.ink}`,
    `--c-muted:${tokens.muted}`,
    `--c-accent:${tokens.accent}`,
    `--c-accent-ink:${tokens.accentInk}`,
    `--c-gold:${tokens.gold}`,
    `--c-border:${tokens.border}`,
  ].join(";");
}

/**
 * Serialises the DB theme into a stylesheet. Emitted server-side on first
 * paint and swapped live by ThemeBridge when the owner edits colours, which
 * is why it targets :root/.dark rather than inline styles — inline styles
 * would clobber whichever mode is not active.
 */
export function themeCss(theme: ThemeConfig): string {
  return [
    `:root{${block(theme.light)};--c-radius:${theme.radius}}`,
    `.dark{${block(theme.dark)}}`,
  ].join("");
}
