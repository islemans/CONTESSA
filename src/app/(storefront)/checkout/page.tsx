"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Building2, Home, Loader2, ShieldCheck } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useCart } from "@/lib/cart";
import { cn, formatDA } from "@/lib/utils";

type DeliveryType = "home" | "desk";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear, ready } = useCart();
  const wilayas = useQuery(api.wilayas.list, {});
  const settings = useQuery(api.settings.get, {});
  const placeOrder = useMutation(api.orders.create);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState<number | "">("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const wilaya = useMemo(
    () => wilayas?.find((w) => w.code === wilayaCode),
    [wilayas, wilayaCode],
  );

  const threshold = settings?.freeDeliveryThreshold ?? 0;
  const freeDelivery = threshold > 0 && subtotal >= threshold;

  const deliveryPrice = !wilaya
    ? null
    : freeDelivery
      ? 0
      : deliveryType === "home"
        ? wilaya.homePrice
        : wilaya.deskPrice;

  const total = subtotal + (deliveryPrice ?? 0);

  // Some wilayas are desk-only (or home-only) — mirrored server-side too.
  const homeAllowed = !wilaya || wilaya.homeAvailable;
  const deskAllowed = !wilaya || wilaya.deskAvailable;

  if (ready && lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-5 py-28 text-center">
        <h1 className="font-display text-3xl text-ink">Votre panier est vide</h1>
        <Link
          href="/shop"
          className="btn-gold mt-8 inline-block rounded-full px-9 py-3.5 text-[0.68rem] tracking-luxe-sm"
        >
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (wilayaCode === "") {
      toast.error("Choisissez votre wilaya.");
      return;
    }

    setSubmitting(true);
    try {
      const { reference } = await placeOrder({
        customerName,
        phone,
        wilayaCode: Number(wilayaCode),
        commune: commune || undefined,
        address: deliveryType === "home" ? address : undefined,
        deliveryType,
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
      // Convex prefixes thrown messages; show only the readable part.
      const message =
        error instanceof Error
          ? error.message.replace(/^\[.*?\]\s*/, "").split("\n")[0]
          : "Une erreur est survenue.";
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 sm:px-6">
      <header>
        <p className="text-[0.6rem] tracking-luxe text-gold">Dernière étape</p>
        <h1 className="mt-2.5 font-display text-4xl text-ink sm:text-5xl">
          Commander
        </h1>
        <div className="mt-4 h-px w-14 bg-gold" />
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12"
      >
        <div className="space-y-9">
          <Fieldset legend="Vos coordonnées">
            <Field label="Nom complet" required half>
              <input
                required
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Amina Benali"
                autoComplete="name"
                className={inputClass}
              />
            </Field>

            <Field label="Téléphone" required half hint="Format : 0551234567">
              <input
                required
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0551234567"
                autoComplete="tel"
                className={inputClass}
              />
            </Field>
          </Fieldset>

          <Fieldset legend="Livraison">
            <Field label="Wilaya" required>
              <select
                required
                value={wilayaCode}
                onChange={(event) => {
                  const code = Number(event.target.value);
                  setWilayaCode(code);
                  const next = wilayas?.find((w) => w.code === code);
                  // Snap away from an option this wilaya doesn't offer.
                  if (next && !next.homeAvailable) setDeliveryType("desk");
                  else if (next && !next.deskAvailable) setDeliveryType("home");
                }}
                className={inputClass}
              >
                <option value="">Choisissez votre wilaya…</option>
                {wilayas?.map((w) => (
                  <option key={w._id} value={w.code}>
                    {String(w.code).padStart(2, "0")} — {w.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <p className="text-[0.62rem] tracking-luxe-sm text-muted">
                Mode de livraison
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <DeliveryOption
                  Icon={Home}
                  title="À domicile"
                  body="Le livreur vous apporte le colis à votre adresse."
                  price={wilaya ? (freeDelivery ? 0 : wilaya.homePrice) : null}
                  selected={deliveryType === "home"}
                  disabled={!homeAllowed}
                  onSelect={() => setDeliveryType("home")}
                />
                <DeliveryOption
                  Icon={Building2}
                  title="Au bureau"
                  body="Vous récupérez le colis au bureau de livraison."
                  price={wilaya ? (freeDelivery ? 0 : wilaya.deskPrice) : null}
                  selected={deliveryType === "desk"}
                  disabled={!deskAllowed}
                  onSelect={() => setDeliveryType("desk")}
                />
              </div>
            </div>

            <Field label="Commune">
              <input
                value={commune}
                onChange={(event) => setCommune(event.target.value)}
                placeholder="Bab Ezzouar"
                className={inputClass}
              />
            </Field>

            {deliveryType === "home" && (
              <Field label="Adresse complète" required>
                <input
                  required
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Cité 5 Juillet, Bât. 12, Apt. 3"
                  autoComplete="street-address"
                  className={inputClass}
                />
              </Field>
            )}

            <Field label="Note (facultatif)">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="Une précision pour le livreur…"
                className={cn(inputClass, "resize-none")}
              />
            </Field>
          </Fieldset>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="surface-card p-5 sm:p-6">
            <h2 className="text-[0.62rem] tracking-luxe-sm text-gold">
              Votre commande
            </h2>

            <ul className="mt-5 space-y-4">
              {lines.map((line) => (
                <li key={`${line.productId}${line.size}${line.color}`} className="flex gap-3">
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
                      {[line.size, line.color, `×${line.quantity}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-ink">
                    {formatDA(line.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Sous-total</dt>
                <dd className="text-ink">{formatDA(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Livraison</dt>
                <dd className={cn(deliveryPrice === 0 && "text-accent")}>
                  {deliveryPrice === null
                    ? "—"
                    : deliveryPrice === 0
                      ? "Offerte"
                      : formatDA(deliveryPrice)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="text-[0.62rem] tracking-luxe-sm text-ink">Total</dt>
                <dd className="font-display text-2xl text-accent">
                  {formatDA(total)}
                </dd>
              </div>
            </dl>

            {threshold > 0 && !freeDelivery && (
              <p className="mt-4 text-xs text-muted">
                Plus que {formatDA(threshold - subtotal)} pour la livraison
                offerte.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[0.68rem] tracking-luxe-sm disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Envoi…" : "Confirmer la commande"}
            </button>

            <p className="mt-4 flex items-start gap-2 text-[0.68rem] leading-relaxed text-muted">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold" strokeWidth={1.5} />
              Paiement à la livraison. Vous ne payez rien maintenant — nous vous
              appelons pour confirmer.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-[var(--c-radius)] border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-gold focus:outline-none";

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <motion.fieldset
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <legend className="text-[0.62rem] tracking-luxe text-gold">{legend}</legend>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </motion.fieldset>
  );
}

function Field({
  label,
  hint,
  required,
  half,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  /** Pairs up on tablet and wider; full width on phones. */
  half?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", half ? "sm:col-span-1" : "sm:col-span-2")}>
      <span className="mb-2 block text-[0.62rem] tracking-luxe-sm text-muted">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[0.65rem] text-muted">{hint}</span>}
    </label>
  );
}

function DeliveryOption({
  Icon,
  title,
  body,
  price,
  selected,
  disabled,
  onSelect,
}: {
  Icon: typeof Home;
  title: string;
  body: string;
  price: number | null;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "rounded-[var(--c-radius)] border p-4 text-left transition-colors",
        disabled
          ? "cursor-not-allowed border-line opacity-40"
          : selected
            ? "border-accent bg-accent/5"
            : "border-line hover:border-gold",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <Icon
          className={cn("size-4", selected ? "text-accent" : "text-muted")}
          strokeWidth={1.5}
        />
        {price !== null && (
          <span
            className={cn(
              "text-xs font-medium",
              price === 0 ? "text-accent" : "text-ink",
            )}
          >
            {price === 0 ? "Offerte" : formatDA(price)}
          </span>
        )}
      </span>
      <span className="mt-3 block text-sm text-ink">{title}</span>
      <span className="mt-1 block text-[0.68rem] leading-relaxed text-muted">
        {disabled ? "Non disponible dans cette wilaya" : body}
      </span>
    </button>
  );
}
