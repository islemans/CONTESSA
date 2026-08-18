"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatDA } from "@/lib/utils";
import {
  DICTIONARIES,
  LOCALES,
  RTL_LOCALES,
  type AnyTranslationKey,
  type Locale,
} from "./dictionaries";

export const LOCALE_STORAGE_KEY = "contessa.locale";
const DEFAULT_LOCALE: Locale = "fr";

type Translate = (
  key: AnyTranslationKey,
  vars?: Record<string, string | number>,
) => string;

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  setLocale: (next: Locale) => void;
  t: Translate;
  /** Price formatter bound to the active language. */
  money: (amount: number) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best starting language for a first-time visitor from their browser
 * preferences, so an Arabic or English speaker isn't dropped into French.
 */
function detectLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isLocale(stored)) return stored;

  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.slice(0, 2).toLowerCase();
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Starts at the SSR value; the inline script in <head> has already set the
  // real lang/dir on <html>, so nothing visibly shifts when this catches up.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  // Keep the document in sync so RTL mirroring, form controls, and screen
  // readers all follow the choice.
  useEffect(() => {
    const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const value = useMemo<I18nValue>(() => {
    const dictionary = DICTIONARIES[locale];
    const isRtl = RTL_LOCALES.includes(locale);

    const t: Translate = (key, vars) => {
      // Fall back through French rather than rendering a raw key.
      let text: string = dictionary[key] ?? DICTIONARIES.fr[key] ?? key;

      // "one form|many forms" — chosen by the `n` variable when present.
      if (text.includes("|")) {
        const [one, many] = text.split("|");
        text = Number(vars?.n) === 1 ? one : many;
      }

      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          text = text.replaceAll(`{${name}}`, String(replacement));
        }
      }
      return text;
    };

    const money = (amount: number) => formatDA(amount, locale);

    return { locale, dir: isRtl ? "rtl" : "ltr", isRtl, setLocale, t, money };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside <I18nProvider>.");
  return context;
}

/**
 * Runs before first paint so an Arabic visitor never sees a left-to-right
 * frame. Mirrors the technique next-themes uses for dark mode. Kept in sync
 * with detectLocale() above.
 */
export const LOCALE_BOOTSTRAP_SCRIPT = `
(function(){try{
var k=${JSON.stringify(LOCALE_STORAGE_KEY)},ls=${JSON.stringify(LOCALES)};
var v=localStorage.getItem(k);
if(ls.indexOf(v)<0){v=null;
var n=navigator.languages||[navigator.language||""];
for(var i=0;i<n.length;i++){var b=(n[i]||"").slice(0,2).toLowerCase();
if(ls.indexOf(b)>=0){v=b;break;}}}
v=v||${JSON.stringify(DEFAULT_LOCALE)};
document.documentElement.lang=v;
document.documentElement.dir=${JSON.stringify(RTL_LOCALES)}.indexOf(v)>=0?"rtl":"ltr";
}catch(e){}})();
`.trim();
