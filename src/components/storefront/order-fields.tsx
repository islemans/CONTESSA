"use client";

import { Building2, Home } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { useDeliveryChoice } from "@/lib/use-delivery-choice";
import { cn, formatDA } from "@/lib/utils";

export const inputClass =
  "w-full rounded-[var(--c-radius)] border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-gold focus:outline-none";

export function Field({
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

/** Name + phone. Shared by checkout and the quick-order sheet. */
export function CustomerFields({
  customerName,
  onName,
  phone,
  onPhone,
}: {
  customerName: string;
  onName: (value: string) => void;
  phone: string;
  onPhone: (value: string) => void;
}) {
  const { t } = useI18n();

  return (
    <>
      <Field label={t("checkout.fullName")} required half>
        <input
          required
          value={customerName}
          onChange={(event) => onName(event.target.value)}
          placeholder={t("checkout.namePlaceholder")}
          autoComplete="name"
          className={inputClass}
        />
      </Field>

      <Field label={t("checkout.phone")} required half hint={t("checkout.phoneHint")}>
        <input
          required
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => onPhone(event.target.value)}
          placeholder="0551234567"
          // Phone numbers stay left-to-right even in the Arabic layout.
          dir="ltr"
          autoComplete="tel"
          className={inputClass}
        />
      </Field>
    </>
  );
}

/** Wilaya picker, delivery mode cards, commune, address and note. */
export function DeliveryFields({
  choice,
  commune,
  onCommune,
  address,
  onAddress,
  note,
  onNote,
}: {
  choice: ReturnType<typeof useDeliveryChoice>;
  commune: string;
  onCommune: (value: string) => void;
  address: string;
  onAddress: (value: string) => void;
  note?: string;
  onNote?: (value: string) => void;
}) {
  const { t } = useI18n();
  const {
    wilayas,
    wilaya,
    wilayaCode,
    selectWilaya,
    deliveryType,
    setDeliveryType,
    freeDelivery,
    homeAllowed,
    deskAllowed,
  } = choice;

  return (
    <>
      <Field label={t("checkout.wilaya")} required>
        <select
          required
          value={wilayaCode}
          onChange={(event) => selectWilaya(Number(event.target.value))}
          className={inputClass}
        >
          <option value="">{t("checkout.wilayaPlaceholder")}</option>
          {wilayas?.map((w) => (
            <option key={w._id} value={w.code}>
              {String(w.code).padStart(2, "0")} — {w.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="sm:col-span-2">
        <p className="text-[0.62rem] tracking-luxe-sm text-muted">
          {t("checkout.deliveryMode")}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DeliveryOption
            Icon={Home}
            title={t("checkout.home")}
            body={t("checkout.homeBody")}
            price={wilaya ? (freeDelivery ? 0 : wilaya.homePrice) : null}
            selected={deliveryType === "home"}
            disabled={!homeAllowed}
            onSelect={() => setDeliveryType("home")}
          />
          <DeliveryOption
            Icon={Building2}
            title={t("checkout.desk")}
            body={t("checkout.deskBody")}
            price={wilaya ? (freeDelivery ? 0 : wilaya.deskPrice) : null}
            selected={deliveryType === "desk"}
            disabled={!deskAllowed}
            onSelect={() => setDeliveryType("desk")}
          />
        </div>
      </div>

      <Field label={t("checkout.commune")}>
        <input
          value={commune}
          onChange={(event) => onCommune(event.target.value)}
          placeholder={t("checkout.communePlaceholder")}
          className={inputClass}
        />
      </Field>

      {/* Only home delivery needs a street address. */}
      {deliveryType === "home" && (
        <Field label={t("checkout.address")} required>
          <input
            required
            value={address}
            onChange={(event) => onAddress(event.target.value)}
            placeholder={t("checkout.addressPlaceholder")}
            autoComplete="street-address"
            className={inputClass}
          />
        </Field>
      )}

      {onNote && (
        <Field label={t("checkout.note")}>
          <textarea
            value={note ?? ""}
            onChange={(event) => onNote(event.target.value)}
            rows={3}
            placeholder={t("checkout.notePlaceholder")}
            className={cn(inputClass, "resize-none")}
          />
        </Field>
      )}
    </>
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
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "rounded-[var(--c-radius)] border p-4 text-start transition-colors",
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
            {price === 0 ? t("checkout.free") : formatDA(price)}
          </span>
        )}
      </span>
      <span className="mt-3 block text-sm text-ink">{title}</span>
      <span className="mt-1 block text-[0.68rem] leading-relaxed text-muted">
        {disabled ? t("checkout.unavailableHere") : body}
      </span>
    </button>
  );
}
