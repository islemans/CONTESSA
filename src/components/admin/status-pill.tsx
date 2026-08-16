"use client";

import { cn } from "@/lib/utils";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  confirmed: "border-sky-500/40 text-sky-600 dark:text-sky-400",
  shipped: "border-violet-500/40 text-violet-600 dark:text-violet-400",
  delivered: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  cancelled: "border-red-500/40 text-red-600 dark:text-red-400",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-[0.55rem] tracking-luxe-sm",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
