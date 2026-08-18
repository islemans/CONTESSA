"use client";

import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Stable order for the status workflow, independent of language. */
export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_KEYS = {
  pending: "a.orders.pending",
  confirmed: "a.orders.confirmed",
  shipped: "a.orders.shipped",
  delivered: "a.orders.delivered",
  cancelled: "a.orders.cancelled",
} as const;

/** Labels have to come from a hook now that they are translated. */
export function useStatusLabel() {
  const { t } = useI18n();
  return (status: OrderStatus) => t(STATUS_KEYS[status]);
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  confirmed: "border-sky-500/40 text-sky-600 dark:text-sky-400",
  shipped: "border-violet-500/40 text-violet-600 dark:text-violet-400",
  delivered: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  cancelled: "border-red-500/40 text-red-600 dark:text-red-400",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const label = useStatusLabel();

  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-[0.55rem] tracking-luxe-sm",
        STATUS_STYLES[status],
      )}
    >
      {label(status)}
    </span>
  );
}
