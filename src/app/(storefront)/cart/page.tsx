"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart, lineKey } from "@/lib/cart";
import { useI18n } from "@/lib/i18n/provider";

export default function CartPage() {
  const { t, money } = useI18n();
  const { lines, subtotal, count, setQuantity, remove, ready } = useCart();

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <div className="h-10 w-40 rounded shimmer" />
        <div className="mt-10 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 rounded-[var(--c-radius)] shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-5 py-28 text-center">
        <ShoppingBag className="mx-auto size-7 text-gold" strokeWidth={1.25} />
        <h1 className="mt-6 font-display text-3xl text-ink">
          {t("cart.emptyTitle")}
        </h1>
        <p className="mt-3 text-sm text-muted">{t("cart.emptyBody")}</p>
        <Link
          href="/shop"
          className="btn-gold mt-9 inline-block rounded-full px-9 py-3.5 text-[0.68rem] tracking-luxe-sm"
        >
          {t("hero.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10 sm:px-6">
      <header>
        <p className="text-[0.6rem] tracking-luxe text-gold">
          {t("cart.eyebrow")}
        </p>
        <h1 className="mt-2.5 font-display text-4xl text-ink sm:text-5xl">
          {t("cart.title")}
        </h1>
        <div className="mt-4 h-px w-14 bg-gold" />
      </header>

      <div className="mt-10 space-y-3">
        <AnimatePresence initial={false}>
          {lines.map((line) => {
            const key = lineKey(line);
            return (
              <motion.article
                key={key}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="surface-card flex gap-4 overflow-hidden p-3 sm:p-4"
              >
                <Link
                  href={`/product/${line.slug}`}
                  className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-md bg-bg sm:w-24"
                >
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center font-display text-2xl text-gold/30">
                      C
                    </span>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/product/${line.slug}`}
                        className="font-display text-lg leading-snug text-ink transition-colors hover:text-accent"
                      >
                        {line.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(key)}
                        aria-label={t("cart.remove", { name: line.name })}
                        className="-me-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-accent"
                      >
                        <X className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>

                    {(line.size || line.color) && (
                      <p className="mt-1 text-[0.62rem] tracking-luxe-sm text-muted">
                        {[line.size, line.color].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        onClick={() => setQuantity(key, line.quantity - 1)}
                        aria-label={t("cart.decrease")}
                        className="grid size-9 place-items-center text-ink"
                      >
                        <Minus className="size-3.5" strokeWidth={1.5} />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums text-ink">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(key, line.quantity + 1)}
                        aria-label={t("cart.increase")}
                        className="grid size-9 place-items-center text-ink"
                      >
                        <Plus className="size-3.5" strokeWidth={1.5} />
                      </button>
                    </div>

                    <span className="text-sm font-medium text-ink">
                      {money(line.price * line.quantity)}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="surface-card mt-8 p-5 sm:p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            {t("cart.subtotalLine", { n: count })}
          </span>
          <span className="font-medium text-ink">{money(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">{t("cart.deliveryLater")}</p>

        <Link
          href="/checkout"
          className="btn-gold mt-6 block rounded-full py-4 text-center text-[0.68rem] tracking-luxe-sm"
        >
          {t("cart.checkout")}
        </Link>

        <Link
          href="/shop"
          className="mt-4 block text-center text-[0.62rem] tracking-luxe-sm text-muted transition-colors hover:text-accent"
        >
          {t("cart.continue")}
        </Link>
      </div>
    </div>
  );
}
