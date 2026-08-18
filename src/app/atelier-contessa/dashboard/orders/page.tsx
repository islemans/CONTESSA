"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ChevronDown, Phone, Trash2 } from "lucide-react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useAdminSession } from "@/lib/admin-session";
import { cleanConvexError } from "@/lib/errors";
import {
  EmptyState,
  PageHeader,
  TableSkeleton,
} from "@/components/admin/ui";
import {
  ORDER_STATUSES,
  StatusPill,
  useStatusLabel,
  type OrderStatus,
} from "@/components/admin/status-pill";
import { cn, formatPhone } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import type { AnyTranslationKey } from "@/lib/i18n/dictionaries";

const FILTERS: { value: OrderStatus | "all"; key: AnyTranslationKey }[] = [
  { value: "all", key: "a.orders.filterAll" },
  { value: "pending", key: "a.orders.filterPending" },
  { value: "confirmed", key: "a.orders.filterConfirmed" },
  { value: "shipped", key: "a.orders.filterShipped" },
  { value: "delivered", key: "a.orders.filterDelivered" },
  { value: "cancelled", key: "a.orders.filterCancelled" },
];

export default function OrdersPage() {
  const { t, money } = useI18n();
  const statusLabel = useStatusLabel();
  const { token } = useAdminSession();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const orders = useQuery(
    api.orders.list,
    token ? { token, status: filter === "all" ? undefined : filter } : "skip",
  );
  const updateStatus = useMutation(api.orders.updateStatus);
  const removeOrder = useMutation(api.orders.remove);

  const handleStatus = async (id: Id<"orders">, status: OrderStatus) => {
    if (!token) return;
    try {
      await updateStatus({ token, id, status });
      toast.success(t("a.orders.statusChanged"));
    } catch (error) {
      toast.error(cleanConvexError(error));
    }
  };

  const handleDelete = async (id: Id<"orders">, reference: string) => {
    if (!token) return;
    if (!confirm(t("a.orders.confirmDelete", { ref: reference }))) return;
    try {
      await removeOrder({ token, id });
      toast.success(t("a.orders.deleted"));
    } catch (error) {
      toast.error(cleanConvexError(error));
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={t("a.nav.atelier")}
        title={t("a.nav.orders")}
        description={t("a.orders.description")}
      />

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[0.6rem] tracking-luxe-sm transition-colors",
              filter === option.value
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-muted hover:border-gold hover:text-accent",
            )}
          >
            {t(option.key)}
          </button>
        ))}
      </div>

      {orders === undefined ? (
        <TableSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState
          title={t("a.orders.none")}
          body={
            filter === "all"
              ? t("a.orders.noneBody")
              : t("a.orders.noneFiltered")
          }
        />
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const open = expanded === order._id;

            return (
              <div key={order._id} className="surface-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : order._id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-ink">
                      {order.customerName}
                      <span className="text-[0.58rem] tracking-luxe-sm text-gold">
                        {order.reference}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-xs text-muted">
                      {order.wilayaName} ·{" "}
                      {order.deliveryType === "home"
                        ? t("a.delivery.home")
                        : t("a.delivery.desk")}{" "}
                      · {t("a.orders.itemCount", { n: order.items.length })}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <StatusPill status={order.status} />
                    <span className="hidden text-sm font-medium text-ink sm:block">
                      {money(order.total)}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted transition-transform duration-300",
                        open && "rotate-180",
                      )}
                      strokeWidth={1.5}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-line p-4">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div>
                            <h3 className="text-[0.55rem] tracking-luxe text-gold">
                              {t("a.orders.delivery")}
                            </h3>
                            <div className="mt-3 space-y-1 text-sm text-muted">
                              <p className="text-ink">{order.customerName}</p>
                              <a
                                href={`tel:${order.phone}`}
                                className="flex items-center gap-1.5 text-accent"
                              >
                                <Phone className="size-3" strokeWidth={1.5} />
                                {formatPhone(order.phone)}
                              </a>
                              <p>
                                {String(order.wilayaCode).padStart(2, "0")} —{" "}
                                {order.wilayaName}
                                {order.commune ? `, ${order.commune}` : ""}
                              </p>
                              {order.address && <p>{order.address}</p>}
                              <p className="pt-1 text-xs">
                                {order.deliveryType === "home"
                                  ? t("a.orders.homeDelivery")
                                  : t("a.orders.deskPickup")}
                              </p>
                              {order.note && (
                                <p className="mt-2 rounded-[var(--c-radius)] border border-line p-3 text-xs italic">
                                  « {order.note} »
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-[0.55rem] tracking-luxe text-gold">
                              {t("a.orders.items")}
                            </h3>
                            <ul className="mt-3 space-y-2 text-sm">
                              {order.items.map((item, index) => (
                                <li key={index} className="flex justify-between gap-3">
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

                            <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-muted">
                                  {t("a.orders.subtotal")}
                                </dt>
                                <dd className="text-ink">{money(order.subtotal)}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted">
                                  {t("a.orders.deliveryFee")}
                                </dt>
                                <dd className="text-ink">
                                  {order.deliveryPrice === 0
                                    ? t("a.orders.free")
                                    : money(order.deliveryPrice)}
                                </dd>
                              </div>
                              <div className="flex justify-between border-t border-line pt-2">
                                <dt className="text-[0.58rem] tracking-luxe-sm text-ink">
                                  {t("a.orders.total")}
                                </dt>
                                <dd className="font-medium text-accent">
                                  {money(order.total)}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-5">
                          <span className="mr-1 text-[0.58rem] tracking-luxe-sm text-muted">
                            {t("a.orders.markAs")}
                          </span>
                          {ORDER_STATUSES.map(
                            (status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatus(order._id, status)}
                                disabled={order.status === status}
                                className={cn(
                                  "rounded-full border px-3.5 py-1.5 text-[0.58rem] tracking-luxe-sm transition-colors",
                                  order.status === status
                                    ? "border-accent bg-accent text-accent-ink"
                                    : "border-line text-muted hover:border-gold hover:text-accent",
                                )}
                              >
                                {statusLabel(status)}
                              </button>
                            ),
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(order._id, order.reference)}
                            aria-label={t("a.orders.deleteOrder")}
                            className="ml-auto grid size-8 place-items-center rounded-full text-muted transition-colors hover:text-red-500"
                          >
                            <Trash2 className="size-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
