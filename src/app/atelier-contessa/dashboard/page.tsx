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
import { formatDA, formatPhone } from "@/lib/utils";
import { StatusPill } from "@/components/admin/status-pill";

export default function OverviewPage() {
  const { token } = useAdminSession();
  const stats = useQuery(api.admin.overview, token ? { token } : "skip");
  const orders = useQuery(api.orders.list, token ? { token } : "skip");

  const recent = orders?.slice(0, 6);
  const base = `${ADMIN_PATH}/dashboard`;

  const tiles = [
    {
      label: "Commandes",
      value: stats?.totalOrders,
      Icon: ShoppingCart,
      href: `${base}/orders`,
    },
    {
      label: "En attente",
      value: stats?.pendingOrders,
      Icon: Clock,
      href: `${base}/orders`,
      highlight: (stats?.pendingOrders ?? 0) > 0,
    },
    {
      label: "Encaissé",
      value: stats ? formatDA(stats.revenue) : undefined,
      Icon: Wallet,
      href: `${base}/orders`,
      hint: "Commandes livrées",
    },
    {
      label: "Produits",
      value: stats ? `${stats.activeProducts}/${stats.totalProducts}` : undefined,
      Icon: Package,
      href: `${base}/products`,
      hint: "Publiés / total",
    },
    {
      label: "Catégories",
      value: stats?.totalCategories,
      Icon: Tags,
      href: `${base}/categories`,
    },
    {
      label: "Rupture",
      value: stats?.outOfStock,
      Icon: AlertTriangle,
      href: `${base}/products`,
      highlight: (stats?.outOfStock ?? 0) > 0,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Atelier"
        title="Aperçu"
        description="Tout ce qui se passe dans votre boutique, en un coup d'œil."
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
          <h2 className="font-display text-2xl text-ink">Dernières commandes</h2>
          <Link
            href={`${base}/orders`}
            className="text-[0.6rem] tracking-luxe-sm text-muted transition-colors hover:text-accent"
          >
            Tout voir
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
            title="Aucune commande pour l'instant"
            body="Dès qu'une cliente commande, elle apparaîtra ici."
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
                    {order.deliveryType === "home" ? "Domicile" : "Bureau"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={order.status} />
                  <span className="text-sm font-medium text-ink">
                    {formatDA(order.total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {stats && stats.totalProducts === 0 && (
        <Card className="mt-8 border-gold/40">
          <h3 className="font-display text-xl text-ink">Pour démarrer</h3>
          <ol className="mt-4 space-y-2 text-sm text-muted">
            <li>
              1. Créez vos{" "}
              <Link href={`${base}/categories`} className="text-accent">
                catégories
              </Link>{" "}
              (Maquillage, Robes, Sacs…).
            </li>
            <li>
              2. Ajoutez vos{" "}
              <Link href={`${base}/products`} className="text-accent">
                produits
              </Link>{" "}
              avec photos, tailles et couleurs.
            </li>
            <li>
              3. Ajustez vos{" "}
              <Link href={`${base}/delivery`} className="text-accent">
                tarifs de livraison
              </Link>{" "}
              par wilaya.
            </li>
            <li>
              4. Réglez le{" "}
              <Link href={`${base}/theme`} className="text-accent">
                thème
              </Link>{" "}
              à votre goût.
            </li>
          </ol>
        </Card>
      )}
    </>
  );
}
