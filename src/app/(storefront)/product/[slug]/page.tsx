"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n/provider";
import { cn, discountPercent } from "@/lib/utils";
import {
  ProductCard,
  ProductCardSkeleton,
  type ProductCardData,
} from "@/components/storefront/product-card";
import { SectionHeading } from "@/components/storefront/section-heading";
import { ProductGallery } from "@/components/storefront/product-gallery";
import {
  QuickOrderSheet,
  type QuickOrderItem,
} from "@/components/storefront/quick-order";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, money } = useI18n();
  const product = useQuery(api.products.getBySlug, { slug });
  const related = useQuery(api.products.related, { slug });
  const { add } = useCart();

  const [size, setSize] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [quickOpen, setQuickOpen] = useState(false);

  // Single-option variants don't deserve a choice — preselect them.
  useEffect(() => {
    if (product?.sizes.length === 1) setSize(product.sizes[0]);
    if (product?.colors.length === 1) setColor(product.colors[0].name);
  }, [product]);

  if (product === undefined) return <ProductSkeleton />;

  if (product === null) {
    return (
      <div className="mx-auto max-w-lg px-5 py-32 text-center">
        <h1 className="font-display text-3xl text-ink">{t("product.notFound")}</h1>
        <p className="mt-3 text-sm text-muted">{t("product.notFoundBody")}</p>
        <Link
          href="/shop"
          className="btn-gold mt-8 inline-block rounded-full px-8 py-3 text-[0.65rem] tracking-luxe-sm"
        >
          {t("product.backToShop")}
        </Link>
      </div>
    );
  }

  const images = [product.coverUrl, ...product.galleryUrls].filter(
    (url): url is string => Boolean(url),
  );
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.trackStock && product.stock <= 0;
  const maxQuantity = product.trackStock ? Math.max(1, product.stock) : 99;

  /** Both buttons need the same variant checks before they can act. */
  const variantsChosen = () => {
    if (product.sizes.length > 0 && !size) {
      toast.error(t("product.chooseSize"));
      return false;
    }
    if (product.colors.length > 0 && !color) {
      toast.error(t("product.chooseColour"));
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    if (!variantsChosen()) return;

    add(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.coverUrl,
        size,
        color,
      },
      quantity,
    );
    toast.success(t("product.added"), { description: product.name });
  };

  const handleQuickOrder = () => {
    if (!variantsChosen()) return;
    setQuickOpen(true);
  };

  const quickItem: QuickOrderItem = {
    productId: product._id,
    name: product.name,
    price: product.price,
    image: product.coverUrl,
    quantity,
    size,
    color,
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-6 lg:px-8">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-[0.62rem] tracking-luxe-sm text-muted transition-colors hover:text-accent"
      >
        <ChevronLeft className="size-3.5 rtl:rotate-180" />
        {t("product.back")}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery
          images={images}
          alt={product.name}
          badge={
            discount ? (
              <span className="rounded-full bg-accent px-3 py-1.5 text-[0.6rem] font-semibold tracking-luxe-sm text-accent-ink">
                −{discount}%
              </span>
            ) : null
          }
        />

        <div className="lg:pt-4">
          {product.categoryName && (
            <Link
              href={`/shop?c=${product.categorySlug}`}
              className="text-[0.6rem] tracking-luxe text-gold"
            >
              {product.categoryName}
            </Link>
          )}

          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl text-accent">
              {money(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-base text-muted line-through">
                {money(product.compareAtPrice)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted">
              {product.description}
            </p>
          )}

          <div className="mt-8 space-y-7">
            {product.sizes.length > 0 && (
              <Options
                label={t("product.size")}
                selected={size}
                options={product.sizes.map((s) => ({ value: s, label: s }))}
                onSelect={setSize}
              />
            )}

            {product.colors.length > 0 && (
              <div>
                <p className="text-[0.62rem] tracking-luxe-sm text-muted">
                  {t("product.colour")}
                  {color ? ` · ${color}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {product.colors.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setColor(option.name)}
                      title={option.name}
                      aria-label={option.name}
                      aria-pressed={color === option.name}
                      className={cn(
                        "grid size-9 place-items-center rounded-full ring-1 ring-inset ring-black/10 transition-transform",
                        color === option.name
                          ? "scale-110 outline-2 outline-offset-2 outline-accent"
                          : "hover:scale-105",
                      )}
                      style={{ backgroundColor: option.hex }}
                    >
                      {color === option.name && (
                        <Check
                          className="size-4 text-white mix-blend-difference"
                          strokeWidth={2.5}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[0.62rem] tracking-luxe-sm text-muted">
                {t("product.quantity")}
              </p>
              <div className="mt-3 inline-flex items-center rounded-full border border-line">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label={t("cart.decrease")}
                  className="grid size-11 place-items-center text-ink transition-colors hover:text-accent"
                >
                  <Minus className="size-4" strokeWidth={1.5} />
                </button>
                <span className="w-10 text-center text-sm tabular-nums text-ink">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  aria-label={t("cart.increase")}
                  className="grid size-11 place-items-center text-ink transition-colors hover:text-accent"
                >
                  <Plus className="size-4" strokeWidth={1.5} />
                </button>
              </div>

              {product.trackStock && product.stock > 0 && product.stock <= 5 && (
                <p className="mt-2.5 text-xs text-accent">
                  {t("product.onlyLeft", { n: product.stock })}
                </p>
              )}
            </div>
          </div>

          {/*
            Order-now leads and add-to-bag is secondary. Most customers here buy
            a single piece, and every extra screen between wanting it and
            ordering it costs a sale.
          */}
          <div className="mt-9 space-y-3">
            <button
              type="button"
              onClick={handleQuickOrder}
              disabled={soldOut}
              className={cn(
                "flex w-full items-center justify-center gap-2.5 rounded-full py-4 text-[0.68rem] tracking-luxe-sm transition-transform",
                soldOut
                  ? "cursor-not-allowed border border-line text-muted"
                  : "btn-gold shadow-lg shadow-accent/20 hover:scale-[1.01] active:scale-95",
              )}
            >
              <Zap className="size-4" strokeWidth={1.5} />
              {soldOut ? t("product.soldOut") : t("product.buyNow")}
            </button>

            {!soldOut && (
              <button
                type="button"
                onClick={handleAdd}
                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line py-4 text-[0.68rem] tracking-luxe-sm text-ink transition-colors hover:border-gold hover:text-accent"
              >
                <ShoppingBag className="size-4" strokeWidth={1.5} />
                {t("product.addToCart")}
              </button>
            )}
          </div>

          <div className="mt-8 space-y-2 border-t border-line pt-6 text-xs text-muted">
            <p>{t("product.deliveryNote")}</p>
            <p>{t("product.codNote")}</p>
          </div>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="pt-28">
          <SectionHeading
            eyebrow={t("product.related")}
            title={t("product.relatedTitle")}
          />
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {related.map((item, index) => (
              <ProductCard
                key={item._id}
                product={item as ProductCardData}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Reachable by thumb on a phone, wherever they've scrolled to. */}
      {!soldOut && (
        <div className="sticky bottom-0 z-40 -mx-5 mt-16 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.6rem] tracking-luxe-sm text-muted">
                {product.name}
              </p>
              <p className="text-sm font-medium text-accent">
                {money(product.price * quantity)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickOrder}
              className="btn-gold shrink-0 rounded-full px-6 py-3 text-[0.62rem] tracking-luxe-sm"
            >
              {t("product.buyNow")}
            </button>
          </div>
        </div>
      )}

      <QuickOrderSheet
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        item={quickItem}
      />
    </div>
  );
}

function Options({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-[0.62rem] tracking-luxe-sm text-muted">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={selected === option.value}
            className={cn(
              "min-w-11 rounded-full border px-4 py-2.5 text-xs transition-colors",
              selected === option.value
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-ink hover:border-gold",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[3/4] rounded-[var(--c-radius)] shimmer" />
        <div className="space-y-5 lg:pt-6">
          <div className="h-3 w-24 rounded shimmer" />
          <div className="h-10 w-3/4 rounded shimmer" />
          <div className="h-7 w-32 rounded shimmer" />
          <div className="h-24 w-full rounded shimmer" />
          <div className="h-12 w-full rounded-full shimmer" />
        </div>
      </div>
      <div className="mt-24 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
