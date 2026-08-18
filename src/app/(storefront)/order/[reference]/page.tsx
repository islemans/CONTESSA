"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Check, Package, Phone } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useI18n } from "@/lib/i18n/provider";
import { formatPhone } from "@/lib/utils";

export default function OrderConfirmationPage() {
  const { t, money } = useI18n();
  const { reference } = useParams<{ reference: string }>();
  const order = useQuery(api.orders.getByReference, { reference });

  if (order === undefined) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <div className="mx-auto h-16 w-16 rounded-full shimmer" />
        <div className="mx-auto mt-8 h-8 w-56 rounded shimmer" />
        <div className="mt-10 h-64 rounded-[var(--c-radius)] shimmer" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-lg px-5 py-28 text-center">
        <h1 className="font-display text-3xl text-ink">{t("order.notFound")}</h1>
        <p className="mt-3 text-sm text-muted">{t("order.notFoundBody")}</p>
        <Link
          href="/shop"
          className="btn-gold mt-8 inline-block rounded-full px-9 py-3.5 text-[0.68rem] tracking-luxe-sm"
        >
          {t("product.backToShop")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 pt-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto grid size-16 place-items-center rounded-full border border-gold"
      >
        <Check className="size-7 text-gold" strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <h1 className="mt-7 font-display text-4xl text-ink">
          {t("order.thanks", { name: order.customerName.split(" ")[0] })}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t("order.recorded", { phone: formatPhone(order.phone) })}
        </p>

        <p className="mt-6 inline-block rounded-full border border-line px-5 py-2 text-[0.65rem] tracking-luxe-sm text-gold">
          {t("order.reference", { ref: order.reference })}
        </p>
      </motion.div>

      <div className="surface-card mt-10 p-5 text-left sm:p-6">
        <h2 className="flex items-center gap-2 text-[0.62rem] tracking-luxe-sm text-gold">
          <Package className="size-3.5" strokeWidth={1.5} />
          {t("order.summary")}
        </h2>

        <ul className="mt-5 space-y-3">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between gap-4 text-sm">
              <span className="min-w-0">
                <span className="block text-ink">{item.name}</span>
                <span className="text-[0.62rem] text-muted">
                  {[item.size, item.color, `×${item.quantity}`]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <span className="shrink-0 text-ink">
                {money(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{t("checkout.subtotal")}</dt>
            <dd className="text-ink">{money(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">
              {t("checkout.deliveryFee")} ·{" "}
              {order.deliveryType === "home"
                ? t("checkout.home")
                : t("checkout.desk")}
            </dt>
            <dd className="text-ink">
              {order.deliveryPrice === 0
                ? t("checkout.free")
                : money(order.deliveryPrice)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt className="text-[0.62rem] tracking-luxe-sm text-ink">
              {t("checkout.total")}
            </dt>
            <dd className="font-display text-2xl text-accent">
              {money(order.total)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 space-y-1 border-t border-line pt-5 text-xs text-muted">
          <p className="text-ink">{order.customerName}</p>
          <p>
            {String(order.wilayaCode).padStart(2, "0")} — {order.wilayaName}
            {order.commune ? `, ${order.commune}` : ""}
          </p>
          {order.address && <p>{order.address}</p>}
          <p className="flex items-center gap-1.5 pt-1">
            <Phone className="size-3" strokeWidth={1.5} />
            {formatPhone(order.phone)}
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">
        {t("order.keepRef", { ref: order.reference })}
      </p>

      <Link
        href="/shop"
        className="mt-8 mb-4 inline-block text-[0.62rem] tracking-luxe-sm text-accent"
      >
        {t("order.continue")}
      </Link>
    </div>
  );
}
