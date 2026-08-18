"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n/provider";
import { useDeliveryChoice } from "@/lib/use-delivery-choice";
import { cleanConvexError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import {
  CustomerFields,
  DeliveryFields,
} from "@/components/storefront/order-fields";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, money } = useI18n();
  const { lines, subtotal, clear, ready } = useCart();
  const placeOrder = useMutation(api.orders.create);

  // Same rules as the product page's quick order — one implementation.
  const choice = useDeliveryChoice(subtotal);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (ready && lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-5 py-28 text-center">
        <h1 className="font-display text-3xl text-ink">{t("cart.emptyTitle")}</h1>
        <Link
          href="/shop"
          className="btn-gold mt-8 inline-block rounded-full px-9 py-3.5 text-[0.68rem] tracking-luxe-sm"
        >
          {t("hero.cta")}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (choice.wilayaCode === "") {
      toast.error(t("checkout.chooseWilaya"));
      return;
    }

    setSubmitting(true);
    try {
      const { reference } = await placeOrder({
        customerName,
        phone,
        wilayaCode: Number(choice.wilayaCode),
        commune: commune || undefined,
        address: choice.deliveryType === "home" ? address : undefined,
        deliveryType: choice.deliveryType,
        note: note || undefined,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          size: line.size,
          color: line.color,
        })),
      });

      clear();
      router.push(`/order/${reference}`);
    } catch (error) {
      toast.error(cleanConvexError(error));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 sm:px-6">
      <header>
        <p className="text-[0.6rem] tracking-luxe text-gold">
          {t("checkout.eyebrow")}
        </p>
        <h1 className="mt-2.5 font-display text-4xl text-ink sm:text-5xl">
          {t("checkout.title")}
        </h1>
        <div className="mt-4 h-px w-14 bg-gold" />
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12"
      >
        <div className="space-y-9">
          <motion.fieldset
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <legend className="text-[0.62rem] tracking-luxe text-gold">
              {t("checkout.yourDetails")}
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CustomerFields
                customerName={customerName}
                onName={setCustomerName}
                phone={phone}
                onPhone={setPhone}
              />
            </div>
          </motion.fieldset>

          <motion.fieldset
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            <legend className="text-[0.62rem] tracking-luxe text-gold">
              {t("checkout.delivery")}
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <DeliveryFields
                choice={choice}
                commune={commune}
                onCommune={setCommune}
                address={address}
                onAddress={setAddress}
                note={note}
                onNote={setNote}
              />
            </div>
          </motion.fieldset>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="surface-card p-5 sm:p-6">
            <h2 className="text-[0.62rem] tracking-luxe-sm text-gold">
              {t("checkout.yourOrder")}
            </h2>

            <ul className="mt-5 space-y-4">
              {lines.map((line) => (
                <li
                  key={`${line.productId}${line.size}${line.color}`}
                  className="flex gap-3"
                >
                  <span className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-md bg-bg">
                    {line.image && (
                      <Image
                        src={line.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">
                      {line.name}
                    </span>
                    <span className="text-[0.62rem] text-muted">
                      {[line.size, line.color, `× ${line.quantity}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-ink">
                    {money(line.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{t("checkout.subtotal")}</dt>
                <dd className="text-ink">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t("checkout.deliveryFee")}</dt>
                <dd className={cn(choice.deliveryPrice === 0 && "text-accent")}>
                  {choice.deliveryPrice === null
                    ? "—"
                    : choice.deliveryPrice === 0
                      ? t("checkout.free")
                      : money(choice.deliveryPrice)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="text-[0.62rem] tracking-luxe-sm text-ink">
                  {t("checkout.total")}
                </dt>
                <dd className="font-display text-2xl text-accent">
                  {money(choice.total)}
                </dd>
              </div>
            </dl>

            {choice.threshold > 0 && !choice.freeDelivery && (
              <p className="mt-4 text-xs text-muted">
                {t("checkout.freeAway", {
                  amount: money(choice.threshold - subtotal),
                })}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[0.68rem] tracking-luxe-sm disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? t("checkout.sending") : t("checkout.confirm")}
            </button>

            <p className="mt-4 flex items-start gap-2 text-[0.68rem] leading-relaxed text-muted">
              <ShieldCheck
                className="mt-0.5 size-3.5 shrink-0 text-gold"
                strokeWidth={1.5}
              />
              {t("checkout.codReassurance")}
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
