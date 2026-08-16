"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Moon, RotateCcw, Sun } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { DEFAULT_SETTINGS } from "@cvx/lib/defaults";
import { useAdminSession } from "@/lib/admin-session";
import { cleanConvexError } from "@/lib/errors";
import { TOKEN_LABELS, type ThemeConfig, type ThemeTokens } from "@/lib/theme-css";
import { Button, Card, Field, PageHeader, Toggle, fieldClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const RADIUS_PRESETS = [
  { label: "Net", value: "0rem" },
  { label: "Doux", value: "0.5rem" },
  { label: "Arrondi", value: "0.75rem" },
  { label: "Très arrondi", value: "1.25rem" },
];

export default function ThemePage() {
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
        <PageHeader eyebrow="Apparence" title="Thème" />
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
      toast.success("Thème appliqué à toute la boutique");
    } catch (error) {
      toast.error(cleanConvexError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!token) return;
    if (!confirm("Revenir au thème d'origine Contessa ?")) return;
    try {
      await resetTheme({ token });
      setDraft(DEFAULT_SETTINGS.theme as ThemeConfig);
      toast.success("Thème réinitialisé");
    } catch (error) {
      toast.error(cleanConvexError(error));
    }
  };

  const dirty =
    settings && JSON.stringify(settings.theme) !== JSON.stringify(draft);

  return (
    <>
      <PageHeader
        eyebrow="Apparence"
        title="Thème"
        description="Ces couleurs pilotent tout le site en direct — aucune mise en ligne nécessaire. Les changements s'appliquent dès que vous enregistrez."
        action={
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="size-3.5" strokeWidth={1.5} />
            Réinitialiser
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-[0.6rem] tracking-luxe text-gold">
              Mode par défaut
            </h2>
            <p className="mt-2 text-xs text-muted">
              Ce que voit une cliente qui arrive pour la première fois. Le logo
              suit automatiquement : version claire ou version dorée.
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
                      {mode === "light" ? "Clair" : "Sombre"}
                    </span>
                    <span className="text-[0.62rem] text-muted">
                      Logo {mode === "light" ? "rose gold" : "doré"}
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
                label="Laisser la cliente changer de thème"
                hint="Affiche le bouton soleil/lune dans la barre du haut."
              />
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-[0.6rem] tracking-luxe text-gold">Couleurs</h2>

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
                    {mode === "light" ? "Clair" : "Sombre"}
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
                {TOKEN_LABELS.map(({ key, label, hint }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-[var(--c-radius)] border border-line p-3"
                  >
                    <input
                      type="color"
                      value={tokens[key]}
                      onChange={(event) => setToken(key, event.target.value)}
                      aria-label={label}
                      className="size-10 shrink-0 cursor-pointer rounded-md border border-line bg-transparent p-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-ink">{label}</p>
                      <p className="truncate text-[0.6rem] text-muted">{hint}</p>
                    </div>
                    <input
                      value={tokens[key]}
                      onChange={(event) => setToken(key, event.target.value)}
                      aria-label={`${label} en hexadécimal`}
                      className="w-20 shrink-0 rounded-md border border-line bg-bg px-2 py-1.5 text-[0.65rem] uppercase text-muted focus:border-gold focus:outline-none"
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </Card>

          <Card>
            <h2 className="text-[0.6rem] tracking-luxe text-gold">Arrondis</h2>
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
                  {preset.label}
                </button>
              ))}
            </div>
            <Field label="Valeur personnalisée" className="mt-5 max-w-xs">
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
            {dirty ? "Appliquer à la boutique" : "Aucun changement"}
          </Button>

          <p className="text-[0.65rem] leading-relaxed text-muted">
            L&apos;aperçu utilise vos couleurs en direct. Une fois appliqué, le
            site entier change instantanément pour toutes les visiteuses.
          </p>
        </aside>
      </div>
    </>
  );
}

/** Sandboxed swatch — inline vars so it previews without touching the page. */
function Preview({ tokens, radius }: { tokens: ThemeTokens; radius: string }) {
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
        Aperçu
      </p>

      <h3
        className="mt-3 font-display text-2xl"
        style={{ color: tokens.ink }}
      >
        Rouge Contessa
      </h3>

      <p className="mt-2 text-xs" style={{ color: tokens.muted }}>
        Fini mat, tenue 12 heures
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
        Ajouter au panier
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
