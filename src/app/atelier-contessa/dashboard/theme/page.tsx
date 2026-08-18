"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Moon, RotateCcw, Sparkles, Sun } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { DEFAULT_SETTINGS, THEME_PRESETS } from "@cvx/lib/defaults";
import { useAdminSession } from "@/lib/admin-session";
import { cleanConvexError } from "@/lib/errors";
import { TOKEN_LABELS, type ThemeConfig, type ThemeTokens } from "@/lib/theme-css";
import { useI18n } from "@/lib/i18n/provider";
import type { AnyTranslationKey } from "@/lib/i18n/dictionaries";
import { Button, Card, Field, PageHeader, Toggle, fieldClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const RADIUS_PRESETS: { key: AnyTranslationKey; value: string }[] = [
  { key: "a.radius.sharp", value: "0rem" },
  { key: "a.radius.soft", value: "0.5rem" },
  { key: "a.radius.round", value: "0.75rem" },
  { key: "a.radius.veryRound", value: "1.25rem" },
];

/** Preset id -> label/note keys, so the palettes read in the owner's language. */
const PRESET_KEYS: Record<string, { label: AnyTranslationKey; note: AnyTranslationKey }> = {
  contessa: { label: "a.preset.contessa", note: "a.preset.contessaNote" },
  valentine: { label: "a.preset.valentine", note: "a.preset.valentineNote" },
  ocean: { label: "a.preset.ocean", note: "a.preset.oceanNote" },
  emerald: { label: "a.preset.emerald", note: "a.preset.emeraldNote" },
};

export default function ThemePage() {
  const { t } = useI18n();
  const { token } = useAdminSession();
  const settings = useQuery(api.settings.get, {});
  const updateTheme = useMutation(api.settings.updateTheme);
  const resetTheme = useMutation(api.settings.resetTheme);
  const { setTheme, resolvedTheme } = useTheme();

  const [draft, setDraft] = useState<ThemeConfig | null>(null);
  const [editing, setEditing] = useState<"light" | "dark">("light");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings && !draft) setDraft(settings.theme as ThemeConfig);
  }, [settings, draft]);

  // Flip the dashboard itself to whichever mode is being edited, so the
  // colour pickers and the surrounding UI always agree.
  useEffect(() => {
    if (resolvedTheme !== editing) setTheme(editing);
  }, [editing, resolvedTheme, setTheme]);

  if (!draft) {
    return (
      <>
        <PageHeader eyebrow={t("a.nav.atelier")} title={t("a.nav.theme")} />
        <div className="h-96 rounded-[var(--c-radius)] shimmer" />
      </>
    );
  }

  const tokens = draft[editing];

  const setToken = (key: keyof ThemeTokens, value: string) => {
    setDraft({ ...draft, [editing]: { ...tokens, [key]: value } });
  };

  const handleSave = async () => {
    if (!token || saving) return;
    setSaving(true);
    try {
      await updateTheme({
        token,
        defaultMode: draft.defaultMode,
        allowUserToggle: draft.allowUserToggle,
        radius: draft.radius,
        light: draft.light,
        dark: draft.dark,
      });
      toast.success(t("a.theme.applied"));
    } catch (error) {
      toast.error(cleanConvexError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!token) return;
    if (!confirm(t("a.theme.confirmReset"))) return;
    try {
      await resetTheme({ token });
      setDraft(DEFAULT_SETTINGS.theme as ThemeConfig);
      toast.success(t("a.theme.resetDone"));
    } catch (error) {
      toast.error(cleanConvexError(error));
    }
  };

  const dirty =
    settings && JSON.stringify(settings.theme) !== JSON.stringify(draft);

  return (
    <>
      <PageHeader
        eyebrow={t("a.nav.atelier")}
        title={t("a.nav.theme")}
        description={t("a.theme.description")}
        action={
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="size-3.5" strokeWidth={1.5} />
            {t("a.theme.reset")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card>
            <h2 className="flex items-center gap-2 text-[0.6rem] tracking-luxe text-gold">
              <Sparkles className="size-3.5" strokeWidth={1.5} />
              {t("a.theme.presets")}
            </h2>
            <p className="mt-2 text-xs text-muted">{t("a.theme.presetsBody")}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {THEME_PRESETS.map((preset) => {
                // Compares against both modes — matching only the previewed one
                // would mark a half-applied preset as active.
                const active =
                  JSON.stringify(draft.light) === JSON.stringify(preset.light) &&
                  JSON.stringify(draft.dark) === JSON.stringify(preset.dark);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, light: preset.light, dark: preset.dark })
                    }
                    className={cn(
                      "rounded-[var(--c-radius)] border p-4 text-left transition-colors",
                      active
                        ? "border-accent bg-accent/5"
                        : "border-line hover:border-gold",
                    )}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex gap-1.5">
                        {(
                          [
                            preset[editing].bg,
                            preset[editing].surface,
                            preset[editing].accent,
                            preset[editing].gold,
                            preset[editing].ink,
                          ] as string[]
                        ).map((colour, i) => (
                          <span
                            key={i}
                            className="size-5 rounded-full ring-1 ring-inset ring-black/10"
                            style={{ backgroundColor: colour }}
                          />
                        ))}
                      </span>
                      {active && (
                        <Check
                          className="size-4 shrink-0 text-accent"
                          strokeWidth={2}
                        />
                      )}
                    </span>
                    <span className="mt-3 block text-sm text-ink">
                      {t(PRESET_KEYS[preset.id].label)}
                    </span>
                    <span className="mt-0.5 block text-[0.65rem] text-muted">
                      {t(PRESET_KEYS[preset.id].note)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="text-[0.6rem] tracking-luxe text-gold">
              {t("a.theme.defaultMode")}
            </h2>
            <p className="mt-2 text-xs text-muted">
              {t("a.theme.defaultModeBody")}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(["light", "dark"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDraft({ ...draft, defaultMode: mode })}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--c-radius)] border p-4 text-left transition-colors",
                    draft.defaultMode === mode
                      ? "border-accent bg-accent/5"
                      : "border-line hover:border-gold",
                  )}
                >
                  {mode === "light" ? (
                    <Sun className="size-4 text-gold" strokeWidth={1.5} />
                  ) : (
                    <Moon className="size-4 text-gold" strokeWidth={1.5} />
                  )}
                  <span>
                    <span className="block text-sm text-ink">
                      {mode === "light" ? t("a.theme.light") : t("a.theme.dark")}
                    </span>
                    <span className="text-[0.62rem] text-muted">
                      {mode === "light"
                        ? t("a.theme.logoRose")
                        : t("a.theme.logoGold")}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <Toggle
                checked={draft.allowUserToggle}
                onChange={(allowUserToggle) =>
                  setDraft({ ...draft, allowUserToggle })
                }
                label={t("a.theme.allowToggle")}
                hint={t("a.theme.allowToggleHint")}
              />
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-[0.6rem] tracking-luxe text-gold">
                {t("a.theme.colours")}
              </h2>

              <div className="flex rounded-full border border-line p-1">
                {(["light", "dark"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setEditing(mode)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[0.58rem] tracking-luxe-sm transition-colors",
                      editing === mode
                        ? "bg-accent text-accent-ink"
                        : "text-muted hover:text-accent",
                    )}
                  >
                    {mode === "light" ? t("a.theme.light") : t("a.theme.dark")}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={editing}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                {TOKEN_LABELS.map(({ key, labelKey, hintKey }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-[var(--c-radius)] border border-line p-3"
                  >
                    <input
                      type="color"
                      value={tokens[key]}
                      onChange={(event) => setToken(key, event.target.value)}
                      aria-label={t(labelKey)}
                      className="size-10 shrink-0 cursor-pointer rounded-md border border-line bg-transparent p-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-ink">{t(labelKey)}</p>
                      <p className="truncate text-[0.6rem] text-muted">
                        {t(hintKey)}
                      </p>
                    </div>
                    <input
                      value={tokens[key]}
                      onChange={(event) => setToken(key, event.target.value)}
                      aria-label={t("a.theme.hexOf", { label: t(labelKey) })}
                      className="w-20 shrink-0 rounded-md border border-line bg-bg px-2 py-1.5 text-[0.65rem] uppercase text-muted focus:border-gold focus:outline-none"
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </Card>

          <Card>
            <h2 className="text-[0.6rem] tracking-luxe text-gold">
              {t("a.theme.radius")}
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDraft({ ...draft, radius: preset.value })}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[0.6rem] tracking-luxe-sm transition-colors",
                    draft.radius === preset.value
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-line text-muted hover:border-gold hover:text-accent",
                  )}
                >
                  {t(preset.key)}
                </button>
              ))}
            </div>
            <Field label={t("a.theme.radiusCustom")} className="mt-5 max-w-xs">
              <input
                value={draft.radius}
                onChange={(event) =>
                  setDraft({ ...draft, radius: event.target.value })
                }
                placeholder="0.75rem"
                className={fieldClass}
              />
            </Field>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Preview tokens={tokens} radius={draft.radius} />

          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!dirty}
            className="w-full"
          >
            {dirty ? t("a.theme.apply") : t("a.theme.noChange")}
          </Button>

          <p className="text-[0.65rem] leading-relaxed text-muted">
            {t("a.theme.previewNote")}
          </p>
        </aside>
      </div>
    </>
  );
}

/** Sandboxed swatch — inline vars so it previews without touching the page. */
function Preview({ tokens, radius }: { tokens: ThemeTokens; radius: string }) {
  const { t } = useI18n();

  return (
    <div
      style={{
        background: tokens.bg,
        borderColor: tokens.border,
        borderRadius: radius,
      }}
      className="overflow-hidden border p-5"
    >
      <p
        className="text-[0.55rem] tracking-luxe"
        style={{ color: tokens.gold }}
      >
        {t("a.theme.preview")}
      </p>

      <h3
        className="mt-3 font-display text-2xl"
        style={{ color: tokens.ink }}
      >
        {t("a.theme.previewProduct")}
      </h3>

      <p className="mt-2 text-xs" style={{ color: tokens.muted }}>
        {t("a.theme.previewDetail")}
      </p>

      <div
        className="mt-4 aspect-[3/4] w-24 border"
        style={{
          background: tokens.surface,
          borderColor: tokens.border,
          borderRadius: radius,
        }}
      />

      <button
        type="button"
        disabled
        className="mt-5 w-full py-3 text-[0.6rem] tracking-luxe-sm"
        style={{
          background: tokens.accent,
          color: tokens.accentInk,
          borderRadius: "999px",
        }}
      >
        {t("a.theme.previewCta")}
      </button>

      <div
        className="mt-4 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${tokens.gold}, transparent)`,
        }}
      />
    </div>
  );
}
