"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  Package,
  ShoppingCart,
  Tags,
  Wallet,
} from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useAdminSession } from "@/lib/admin-session";
import { ADMIN_PATH } from "@/lib/admin-path";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { formatPhone } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import { StatusPill } from "@/components/admin/status-pill";

export default function OverviewPage() {
  const { t, money } = useI18n();
  const { token } = useAdminSession();
  const stats = useQuery(api.admin.overview, token ? { token } : "skip");
  const orders = useQuery(api.orders.list, token ? { token } : "skip");

  const recent = orders?.slice(0, 6);
  const base = `${ADMIN_PATH}/dashboard`;

  const tiles = [
    {
      label: t("a.overview.orders"),
      value: stats?.totalOrders,
      Icon: ShoppingCart,
      href: `${base}/orders`,
    },
    {
      label: t("a.overview.pending"),
      value: stats?.pendingOrders,
      Icon: Clock,
      href: `${base}/orders`,
      highlight: (stats?.pendingOrders ?? 0) > 0,
    },
    {
      label: t("a.overview.earned"),
      value: stats ? money(stats.revenue) : undefined,
      Icon: Wallet,
      href: `${base}/orders`,
      hint: t("a.overview.earnedHint"),
    },
    {
      label: t("a.overview.products"),
      value: stats ? `${stats.activeProducts}/${stats.totalProducts}` : undefined,
      Icon: Package,
      href: `${base}/products`,
      hint: t("a.overview.productsHint"),
    },
    {
      label: t("a.overview.categories"),
      value: stats?.totalCategories,
      Icon: Tags,
      href: `${base}/categories`,
    },
    {
      label: t("a.overview.outOfStock"),
      value: stats?.outOfStock,
      Icon: AlertTriangle,
      href: `${base}/products`,
      highlight: (stats?.outOfStock ?? 0) > 0,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("a.nav.atelier")}
        title={t("a.nav.overview")}
        description={t("a.overview.description")}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {tiles.map(({ label, value, Icon, href, hint, highlight }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Link href={href} className="block">
              <Card className="transition-colors hover:border-gold">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[0.55rem] tracking-luxe-sm text-muted">
                    {label}
                  </span>
                  <Icon
                    className={highlight ? "size-4 text-accent" : "size-4 text-gold"}
                    strokeWidth={1.5}
                  />
                </div>
                <p className="mt-4 font-display text-2xl text-ink sm:text-3xl">
                  {value ?? <span className="inline-block h-7 w-16 rounded shimmer" />}
                </p>
                {hint && <p className="mt-1 text-[0.62rem] text-muted">{hint}</p>}
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink">
            {t("a.overview.recent")}
          </h2>
          <Link
            href={`${base}/orders`}
            className="text-[0.6rem] tracking-luxe-sm text-muted transition-colors hover:text-accent"
          >
            {t("a.overview.seeAll")}
          </Link>
        </div>

        {recent === undefined ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-[var(--c-radius)] shimmer" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            title={t("a.overview.noOrders")}
            body={t("a.overview.noOrdersBody")}
          />
        ) : (
          <div className="space-y-2">
            {recent.map((order) => (
              <Link
                key={order._id}
                href={`${base}/orders`}
                className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-gold"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink">
                    {order.customerName}
                    <span className="ml-2 text-[0.6rem] tracking-luxe-sm text-gold">
                      {order.reference}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatPhone(order.phone)} · {order.wilayaName} ·{" "}
                    {order.deliveryType === "home"
                      ? t("a.overview.home")
                      : t("a.overview.desk")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={order.status} />
                  <span className="text-sm font-medium text-ink">
                    {money(order.total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {stats && stats.totalProducts === 0 && (
        <Card className="mt-8 border-gold/40">
          <h3 className="font-display text-xl text-ink">
            {t("a.overview.start")}
          </h3>
          {/* Each step is one sentence with a {link} slot, so translators can
              put the link wherever the grammar needs it. */}
          <ol className="mt-4 space-y-2 text-sm text-muted">
            <StartStep
              n={1}
              sentence={t("a.overview.step1")}
              href={`${base}/categories`}
              linkText={t("a.nav.categories")}
            />
            <StartStep
              n={2}
              sentence={t("a.overview.step2")}
              href={`${base}/products`}
              linkText={t("a.nav.products")}
            />
            <StartStep
              n={3}
              sentence={t("a.overview.step3")}
              href={`${base}/delivery`}
              linkText={t("a.overview.step3Link")}
            />
            <StartStep
              n={4}
              sentence={t("a.overview.step4")}
              href={`${base}/theme`}
              linkText={t("a.nav.theme")}
            />
          </ol>
        </Card>
      )}
    </>
  );
}

/** Splits a translated sentence on its {link} slot and drops a Link in. */
function StartStep({
  n,
  sentence,
  href,
  linkText,
}: {
  n: number;
  sentence: string;
  href: string;
  linkText: string;
}) {
  const [before, after = ""] = sentence.split("{link}");
  return (
    <li>
      {n}. {before}
      <Link href={href} className="text-accent">
        {linkText}
      </Link>
      {after}
    </li>
  );
}
