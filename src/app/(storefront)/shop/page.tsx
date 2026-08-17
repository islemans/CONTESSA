"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { api } from "@cvx/_generated/api";
import {
  ProductCard,
  ProductCardSkeleton,
  type ProductCardData,
} from "@/components/storefront/product-card";
import { useI18n } from "@/lib/i18n/provider";
import { localizedName } from "@/lib/i18n/localize";
import { cn } from "@/lib/utils";

type Sort = "new" | "price-asc" | "price-desc";

export default function ShopPage() {
  // useSearchParams needs a Suspense parent, or the whole route opts out of
  // static rendering at build time.
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <Shop />
    </Suspense>
  );
}

function Shop() {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const activeCategory = params.get("c") ?? undefined;

  const categories = useQuery(api.categories.list, {});
  const products = useQuery(api.products.list, {
    categorySlug: activeCategory,
  });

  const [sort, setSort] = useState<Sort>("new");

  const sorted = useMemo(() => {
    if (!products) return undefined;
    const copy = [...products];
    if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
    return copy;
  }, [products, sort]);

  const activeCategoryDoc = categories?.find((c) => c.slug === activeCategory);
  const heading = activeCategoryDoc
    ? localizedName(activeCategoryDoc, locale)
    : t("shop.title");

  const sorts: { value: Sort; label: string }[] = [
    { value: "new", label: t("shop.sortNew") },
    { value: "price-asc", label: t("shop.sortPriceAsc") },
    { value: "price-desc", label: t("shop.sortPriceDesc") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[0.6rem] tracking-luxe text-gold">
          {t("shop.brand")}
        </p>
        <h1 className="mt-2.5 font-display text-4xl text-ink sm:text-5xl">
          {heading}
        </h1>
        <div className="mt-4 h-px w-14 bg-gold" />
      </motion.header>

      {/* Horizontal rail: thumb-scrollable on mobile, no wrapping. */}
      <div className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        <CategoryChip href="/shop" active={!activeCategory}>
          {t("nav.all")}
        </CategoryChip>
        {categories?.map((category) => (
          <CategoryChip
            key={category._id}
            href={`/shop?c=${category.slug}`}
            active={activeCategory === category.slug}
          >
            {localizedName(category, locale)}
          </CategoryChip>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-y border-line py-3">
        <p className="text-xs text-muted">
          {sorted ? t("shop.count", { n: sorted.length }) : "…"}
        </p>

        <label className="flex items-center gap-2 text-xs text-muted">
          <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
          <span className="sr-only">{t("shop.sortBy")}</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="bg-transparent text-xs text-ink focus:outline-none"
          >
            {sorts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
        {sorted === undefined
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : sorted.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product as ProductCardData}
                index={index}
                priority={index < 2}
              />
            ))}
      </div>

      {sorted?.length === 0 && (
        <div className="rounded-[var(--c-radius)] border border-dashed border-line py-24 text-center">
          <p className="font-display text-2xl text-ink">
            {t("shop.emptyTitle")}
          </p>
          <p className="mt-2 text-sm text-muted">{t("shop.emptyBody")}</p>
          <Link
            href="/shop"
            className="mt-6 inline-block text-[0.62rem] tracking-luxe-sm text-accent"
          >
            {t("shop.seeAllItems")}
          </Link>
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-[0.62rem] tracking-luxe-sm transition-colors",
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-line text-muted hover:border-gold hover:text-accent",
      )}
    >
      {children}
    </Link>
  );
}

function ShopSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
      <div className="h-10 w-48 rounded shimmer" />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
