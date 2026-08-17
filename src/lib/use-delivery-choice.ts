"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";

export type DeliveryType = "home" | "desk";

/**
 * Owns wilaya + delivery-mode selection and the resulting quote.
 *
 * Shared by the checkout page and the quick-order sheet on the product page.
 * Both need the same rules — which modes a wilaya offers, when delivery is
 * free — and two copies would eventually disagree with each other and with the
 * server. The server recomputes everything on submit regardless; this is only
 * what the customer sees while filling the form in.
 */
export function useDeliveryChoice(subtotal: number) {
  const wilayas = useQuery(api.wilayas.list, {});
  const settings = useQuery(api.settings.get, {});

  const [wilayaCode, setWilayaCode] = useState<number | "">("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");

  const wilaya = useMemo(
    () => wilayas?.find((w) => w.code === wilayaCode),
    [wilayas, wilayaCode],
  );

  const threshold = settings?.freeDeliveryThreshold ?? 0;
  const freeDelivery = threshold > 0 && subtotal >= threshold;

  // null while no wilaya is chosen — the UI shows a dash rather than "0 DA",
  // which would read as free delivery.
  const deliveryPrice: number | null = !wilaya
    ? null
    : freeDelivery
      ? 0
      : deliveryType === "home"
        ? wilaya.homePrice
        : wilaya.deskPrice;

  const homeAllowed = !wilaya || wilaya.homeAvailable;
  const deskAllowed = !wilaya || wilaya.deskAvailable;

  /** Selecting a wilaya snaps away from a mode it doesn't offer. */
  const selectWilaya = useCallback(
    (code: number | "") => {
      setWilayaCode(code);
      const next = wilayas?.find((w) => w.code === code);
      if (!next) return;
      if (!next.homeAvailable) setDeliveryType("desk");
      else if (!next.deskAvailable) setDeliveryType("home");
    },
    [wilayas],
  );

  return {
    wilayas,
    wilaya,
    wilayaCode,
    selectWilaya,
    deliveryType,
    setDeliveryType,
    deliveryPrice,
    freeDelivery,
    threshold,
    homeAllowed,
    deskAllowed,
    total: subtotal + (deliveryPrice ?? 0),
  };
}
