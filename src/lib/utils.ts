import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Unicode bidi isolates.
 *
 * A price is a mixed run — European digits plus a Latin currency word — and
 * inside an Arabic (RTL) paragraph the bidi algorithm lays those segments out
 * right-to-left, so "8 900 DA" renders as "DA 8 900". Wrapping the whole thing
 * in LRI…PDI pins it to its own left-to-right run, whatever direction the text
 * around it flows.
 *
 * Doing it here rather than with a <bdi> wrapper means it also holds when a
 * price is interpolated into a translated sentence, where there is no element
 * to hang an attribute on.
 */
const LRI = "⁦"; // Left-to-Right Isolate
const PDI = "⁩"; // Pop Directional Isolate

/** Currency abbreviation per language. Algeria writes dinars as DA or دج. */
const CURRENCY: Record<string, string> = {
  fr: "DA",
  en: "DA",
  ar: "دج",
};

/**
 * 4500 → "4 500 DA" (or "4 500 دج" in Arabic), isolated for RTL safety.
 *
 * Grouping is always French-style regardless of language: Algeria uses Western
 * digits in prices, and `toLocaleString("ar")` would emit Arabic-Indic ones.
 */
export function formatDA(amount: number, locale = "fr"): string {
  const grouped = Math.round(amount)
    .toLocaleString("fr-FR")
    .replace(/ | /g, " ");
  // No-break space keeps the amount and its currency on one line.
  return `${LRI}${grouped} ${CURRENCY[locale] ?? CURRENCY.fr}${PDI}`;
}

export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Digits only, grouped as 0551 23 45 67 for display. Isolated for the same
 * reason as prices — a phone number must not reorder in an Arabic layout.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  const grouped = `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  return `${LRI}${grouped}${PDI}`;
}

/** Wraps any mixed-script value so it keeps its own direction. Cheap and safe. */
export function isolate(value: string): string {
  return `${LRI}${value}${PDI}`;
}
