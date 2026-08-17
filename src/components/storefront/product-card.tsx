"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/provider";
import { cn, discountPercent, formatDA } from "@/lib/utils";

export type ProductCardData = {
  _id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  coverUrl: string | null;
  galleryUrls: string[];
  categoryName: string | null;
  stock: number;
  trackStock: boolean;
  colors: { name: string; hex: string }[];
};

export function ProductCard({
  product,
  index = 0,
  priority = false,
}: {
  product: ProductCardData;
  index?: number;
  priority?: boolean;
}) {
  const { t } = useI18n();
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.trackStock && product.stock <= 0;
  // Second photo cross-fades in on hover; skipped when there's only a cover.
  const hoverImage = product.galleryUrls[0] ?? null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index, 5) * 0.06,
      }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block">
        {/* Portrait 3:4 on every breakpoint — the brand's fixed frame. */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--c-radius)] bg-surface">
          {product.coverUrl ? (
            <>
              <Image
                src={product.coverUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                className={cn(
                  "object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  hoverImage
                    ? "group-hover:opacity-0"
                    : "group-hover:scale-105",
                  soldOut && "opacity-60 grayscale",
                )}
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="grid h-full place-items-center border border-line">
              <span className="font-display text-4xl text-gold/40">C</span>
            </div>
          )}

          <div className="pointer-events-none absolute start-3 top-3 flex flex-col gap-1.5">
            {discount && !soldOut && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-[0.6rem] font-semibold tracking-luxe-sm text-accent-ink">
                −{discount}%
              </span>
            )}
            {soldOut && (
              <span className="rounded-full bg-ink px-2.5 py-1 text-[0.6rem] font-semibold tracking-luxe-sm text-bg">
                {t("product.soldOut")}
              </span>
            )}
          </div>
        </div>

        <div className="px-0.5 pt-3.5">
          {product.categoryName && (
            <p className="text-[0.58rem] tracking-luxe-sm text-muted">
              {product.categoryName}
            </p>
          )}

          <h3 className="mt-1.5 line-clamp-2 font-display text-[1.05rem] leading-snug text-ink transition-colors group-hover:text-accent sm:text-lg">
            {product.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-medium text-ink">
              {formatDA(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-muted line-through">
                {formatDA(product.compareAtPrice)}
              </span>
            )}
          </div>

          {product.colors.length > 0 && (
            <div className="mt-2.5 flex gap-1.5">
              {product.colors.slice(0, 5).map((color) => (
                <span
                  key={color.name}
                  title={color.name}
                  style={{ backgroundColor: color.hex }}
                  className="size-3 rounded-full ring-1 ring-inset ring-black/10"
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[0.6rem] text-muted">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] rounded-[var(--c-radius)] shimmer" />
      <div className="mt-3.5 h-2.5 w-16 rounded shimmer" />
      <div className="mt-2.5 h-3.5 w-full rounded shimmer" />
      <div className="mt-2 h-3 w-20 rounded shimmer" />
    </div>
  );
}
