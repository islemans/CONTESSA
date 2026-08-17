"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Languages } from "lucide-react";
import { LOCALES, LOCALE_SHORT, type Locale } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  variant = "chip",
}: {
  className?: string;
  /** "chip" for the top bar, "list" for the mobile drawer. */
  variant?: "chip" | "list";
}) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  // A dropdown that survives an outside tap feels broken on a phone.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "list") {
    return (
      <div className={cn("flex gap-2", className)}>
        {LOCALES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            lang={option}
            className={cn(
              "flex-1 rounded-full border px-3 py-2 text-[0.62rem] tracking-luxe-sm transition-colors",
              locale === option
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-muted hover:border-gold hover:text-accent",
            )}
          >
            {LOCALE_SHORT[option]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={wrapper} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("lang.label")}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-9 items-center gap-1.5 rounded-full border border-line px-2.5 text-ink transition-colors hover:border-gold hover:text-accent"
      >
        <Languages className="size-4" strokeWidth={1.5} />
        <span className="text-[0.6rem] font-medium tabular-nums">
          {LOCALE_SHORT[locale]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            // Anchored to the inline end so it never runs off-screen in RTL.
            className="absolute end-0 top-11 z-50 w-40 overflow-hidden rounded-[var(--c-radius)] border border-line bg-surface py-1 shadow-xl"
          >
            {LOCALES.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={locale === option}
                  lang={option}
                  dir={option === "ar" ? "rtl" : "ltr"}
                  onClick={() => {
                    setLocale(option);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors",
                    locale === option
                      ? "text-accent"
                      : "text-ink hover:bg-bg hover:text-accent",
                  )}
                >
                  {t(`lang.${option}` as `lang.${Locale}`)}
                  {locale === option && (
                    <Check className="size-3.5 shrink-0" strokeWidth={2} />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
