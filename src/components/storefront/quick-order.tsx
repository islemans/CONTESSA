"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ShieldCheck, X, Zap } from "lucide-react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useI18n } from "@/lib/i18n/provider";
import { useDeliveryChoice } from "@/lib/use-delivery-choice";
import { cleanConvexError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { CustomerFields, DeliveryFields } from "./order-fields";

const EASE = [0.22, 1, 0.36, 1] as const;

export type QuickOrderItem = {
  productId: Id<"products">;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  size?: string;
  color?: string;
};

/**
 * Buy-one-thing-now, straight from the product page.
 *
 * Reuses `orders.create` unchanged — the cart was never part of the order
 * contract, only a way of collecting items. Skipping it removes two taps, which
 * matters when nearly every customer is on a phone.
 */
export function QuickOrderSheet({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: QuickOrderItem | null;
}) {
  const router = useRouter();
  const { t, money } = useI18n();
  const placeOrder = useMutation(api.orders.create);

  const subtotal = item ? item.price * item.quantity : 0;
  const choice = useDeliveryChoice(subtotal);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Locks the page behind the sheet — iOS Safari scrolls it otherwise.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !item) return;

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
        items: [
          {
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          },
        ],
      });

      router.push(`/order/${reference}`);
    } catch (error) {
      toast.error(cleanConvexError(error));
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-label={t("quick.title")}
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-bg p-6 sm:max-w-lg sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[0.6rem] tracking-luxe text-gold">
                  <Zap className="size-3.5" strokeWidth={1.5} />
                  {t("quick.title")}
                </p>
                <p className="mt-2.5 max-w-xs text-xs leading-relaxed text-muted">
                  {t("quick.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("quick.close")}
                className="-me-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-accent"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* What they're buying, so the sheet is self-explanatory. */}
            <div className="mt-5 flex items-center gap-3 rounded-[var(--c-radius)] border border-line bg-surface p-3">
              <span className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-md bg-bg">
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">{item.name}</span>
                <span className="text-[0.62rem] text-muted">
                  {[item.size, item.color, `× ${item.quantity}`]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <span className="shrink-0 text-sm font-medium text-ink">
                {money(subtotal)}
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <CustomerFields
                customerName={customerName}
                onName={setCustomerName}
                phone={phone}
                onPhone={setPhone}
              />
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

            <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
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
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
