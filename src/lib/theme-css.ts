import { DEFAULT_SETTINGS } from "@cvx/lib/defaults";
import type { AnyTranslationKey } from "./i18n/dictionaries";

export type ThemeTokens = typeof DEFAULT_SETTINGS.theme.light;
export type ThemeConfig = typeof DEFAULT_SETTINGS.theme;
export type SiteSettings = typeof DEFAULT_SETTINGS;

/** Token rows for the theme editor, labelled through the dictionary. */
export const TOKEN_LABELS: {
  key: keyof ThemeTokens;
  labelKey: AnyTranslationKey;
  hintKey: AnyTranslationKey;
}[] = [
  { key: "bg", labelKey: "a.token.bg", hintKey: "a.token.bgHint" },
  { key: "surface", labelKey: "a.token.surface", hintKey: "a.token.surfaceHint" },
  { key: "ink", labelKey: "a.token.ink", hintKey: "a.token.inkHint" },
  { key: "muted", labelKey: "a.token.muted", hintKey: "a.token.mutedHint" },
  { key: "accent", labelKey: "a.token.accent", hintKey: "a.token.accentHint" },
  {
    key: "accentInk",
    labelKey: "a.token.accentInk",
    hintKey: "a.token.accentInkHint",
  },
  { key: "gold", labelKey: "a.token.gold", hintKey: "a.token.goldHint" },
  { key: "border", labelKey: "a.token.border", hintKey: "a.token.borderHint" },
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
