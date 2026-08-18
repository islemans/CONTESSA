"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useAdminSession } from "@/lib/admin-session";
import { ADMIN_PATH } from "@/lib/admin-path";
import { cleanConvexError } from "@/lib/errors";
import {
  Button,
  EmptyState,
  PageHeader,
  TableSkeleton,
  fieldClass,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

export default function ProductsPage() {
  const { t, money } = useI18n();
  const { token } = useAdminSession();
  const products = useQuery(api.products.listAll, token ? { token } : "skip");
  const toggleField = useMutation(api.products.toggle);
  const removeProduct = useMutation(api.products.remove);
  const [term, setTerm] = useState("");

  const base = `${ADMIN_PATH}/dashboard/products`;

  const visible = products?.filter((p) =>
    p.name.toLowerCase().includes(term.trim().toLowerCase()),
  );

  const handleToggle = async (
    id: Id<"products">,
    field: "isActive" | "isFeatured",
  ) => {
    if (!token) return;
    try {
      await toggleField({ token, id, field });
    } catch (error) {
      toast.error(cleanConvexError(error));
    }
  };

  const handleDelete = async (id: Id<"products">, name: string) => {
    if (!token) return;
    if (!confirm(t("a.products.confirmDelete", { name }))) {
      return;
    }
    try {
      await removeProduct({ token, id });
      toast.success(t("a.products.deleted"));
    } catch (error) {
      toast.error(cleanConvexError(error));
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={t("a.nav.atelier")}
        title={t("a.nav.products")}
        description={t("a.products.description")}
        action={
          <Link href={`${base}/new`}>
            <Button>
              <Plus className="size-3.5" strokeWidth={2} />
              {t("a.products.new")}
            </Button>
          </Link>
        }
      />

      {products && products.length > 0 && (
        <div className="relative mb-5">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t("a.products.search")}
            className={`${fieldClass} pl-11`}
          />
        </div>
      )}

      {visible === undefined ? (
        <TableSkeleton />
      ) : visible.length === 0 ? (
        <EmptyState
          title={term ? t("a.products.noResults") : t("a.products.none")}
          body={
            term ? t("a.products.noResultsBody") : t("a.products.noneBody")
          }
          action={
            !term && (
              <Link href={`${base}/new`}>
                <Button>
                  <Plus className="size-3.5" strokeWidth={2} />
                  {t("a.products.new")}
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {visible.map((product) => (
            <div
              key={product._id}
              className="surface-card flex items-center gap-4 p-3 sm:p-4"
            >
              <Link
                href={`${base}/${product._id}`}
                className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-md bg-bg sm:w-16"
              >
                {product.coverUrl ? (
                  <Image
                    src={product.coverUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center font-display text-xl text-gold/40">
                    C
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`${base}/${product._id}`}
                  className="block truncate font-display text-base text-ink transition-colors hover:text-accent sm:text-lg"
                >
                  {product.name}
                </Link>
                <p className="mt-0.5 truncate text-[0.62rem] tracking-luxe-sm text-muted">
                  {product.categoryName ?? t("a.products.noCategory")}
                  {product.trackStock &&
                    ` · ${t("a.products.inStock", { n: product.stock })}`}
                </p>
                <p className="mt-1 text-sm font-medium text-accent sm:hidden">
                  {money(product.price)}
                </p>
              </div>

              <span className="hidden shrink-0 text-sm font-medium text-ink sm:block">
                {money(product.price)}
              </span>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => handleToggle(product._id, "isFeatured")}
                  aria-label={t("a.products.feature")}
                  title={
                    product.isFeatured
                      ? t("a.products.featured")
                      : t("a.products.feature")
                  }
                  className={cn(
                    "grid size-9 place-items-center rounded-full transition-colors",
                    product.isFeatured
                      ? "text-gold"
                      : "text-muted hover:text-accent",
                  )}
                >
                  <Star
                    className="size-4"
                    strokeWidth={1.5}
                    fill={product.isFeatured ? "currentColor" : "none"}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggle(product._id, "isActive")}
                  aria-label={
                    product.isActive ? t("a.products.hide") : t("a.products.publish")
                  }
                  title={
                    product.isActive
                      ? t("a.products.visibleInShop")
                      : t("a.products.hidden")
                  }
                  className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-accent"
                >
                  {product.isActive ? (
                    <Eye className="size-4" strokeWidth={1.5} />
                  ) : (
                    <EyeOff className="size-4" strokeWidth={1.5} />
                  )}
                </button>

                <Link
                  href={`${base}/${product._id}`}
                  aria-label={t("a.edit")}
                  className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-accent"
                >
                  <Pencil className="size-4" strokeWidth={1.5} />
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(product._id, product.name)}
                  aria-label={t("a.delete")}
                  className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-red-500"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
