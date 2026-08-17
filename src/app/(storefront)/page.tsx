"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Sparkles, Truck } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useI18n } from "@/lib/i18n/provider";
import { localizedName } from "@/lib/i18n/localize";
import { HeroLogo } from "@/components/storefront/hero-logo";
import {
  AuroraBackground,
  FloatingMotes,
} from "@/components/storefront/aurora-background";
import {
  ProductCard,
  ProductCardSkeleton,
  type ProductCardData,
} from "@/components/storefront/product-card";
import { SectionHeading } from "@/components/storefront/section-heading";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HomePage() {
  const { t, locale } = useI18n();
  const categories = useQuery(api.categories.list, {});
  const featured = useQuery(api.products.list, { featuredOnly: true, limit: 8 });
  const latest = useQuery(api.products.list, { limit: 8 });

  // Before anything is flagged "featured", show the newest arrivals instead of
  // an empty shelf.
  const hero = featured && featured.length > 0 ? featured : latest;

  return (
    <>
      <Hero />

      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t("home.collections")}
            title={t("home.exploreHouse")}
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: EASE, delay: index * 0.07 }}
              >
                <Link
                  href={`/shop?c=${category.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-[var(--c-radius)] bg-surface"
                >
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={localizedName(category, locale)}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                    />
                  ) : (
                    <div className="grid h-full place-items-center border border-line">
                      <span className="font-display text-5xl text-gold/30">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-display text-xl text-white sm:text-2xl">
                      {localizedName(category, locale)}
                    </h3>
                    <span className="mt-1 flex items-center gap-1.5 text-[0.6rem] tracking-luxe-sm text-white/80">
                      {t("home.discover")}
                      <ArrowRight className="size-3 transition-transform duration-500 group-hover:translate-x-1 rtl:rotate-180" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("home.selection")}
          title={t("home.favourites")}
          action={{ href: "/shop", label: t("home.seeAll") }}
        />

        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {hero === undefined
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : hero.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product as ProductCardData}
                  index={index}
                  priority={index < 2}
                />
              ))}
        </div>

        {hero?.length === 0 && (
          <div className="rounded-[var(--c-radius)] border border-dashed border-line py-20 text-center">
            <Sparkles className="mx-auto size-6 text-gold" strokeWidth={1.5} />
            <p className="mt-4 font-display text-xl text-ink">
              {t("home.comingSoon")}
            </p>
            <p className="mt-2 text-sm text-muted">{t("home.comingSoonBody")}</p>
          </div>
        )}
      </section>

      <Assurances />
    </>
  );
}

function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden">
      {/* Drifting light and rising motes — both purely decorative. */}
      <AuroraBackground />
      <FloatingMotes />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 pb-4 pt-12 text-center sm:pt-20">
        <HeroLogo className="w-56 sm:w-80" />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
          className="mt-8"
        >
          <Link
            href="/shop"
            className="btn-gold inline-block rounded-full px-9 py-3.5 text-[0.68rem] tracking-luxe-sm shadow-lg shadow-accent/20 transition-transform hover:scale-[1.03] active:scale-95"
          >
            {t("hero.cta")}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.65 }}
          className="rule-fade mt-14 w-full max-w-xs"
        />
      </div>
    </section>
  );
}

function Assurances() {
  const { t } = useI18n();

  const items = [
    {
      Icon: Truck,
      title: t("home.assurance1Title"),
      body: t("home.assurance1Body"),
    },
    {
      Icon: BadgeCheck,
      title: t("home.assurance2Title"),
      body: t("home.assurance2Body"),
    },
    {
      Icon: Sparkles,
      title: t("home.assurance3Title"),
      body: t("home.assurance3Body"),
    },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-5 pt-24 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {items.map(({ Icon, title, body }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: EASE, delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="surface-card p-6 text-center sm:p-7"
          >
            <Icon className="mx-auto size-5 text-gold" strokeWidth={1.25} />
            <h3 className="mt-4 text-[0.65rem] tracking-luxe-sm text-ink">
              {title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
