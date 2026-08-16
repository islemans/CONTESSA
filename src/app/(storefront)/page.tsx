"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Sparkles, Truck } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { Logo } from "@/components/storefront/logo";
import {
  ProductCard,
  ProductCardSkeleton,
  type ProductCardData,
} from "@/components/storefront/product-card";
import { SectionHeading } from "@/components/storefront/section-heading";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HomePage() {
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
            eyebrow="Collections"
            title="Explorer la maison"
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
                      alt={category.name}
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
                      {category.name}
                    </h3>
                    <span className="mt-1 flex items-center gap-1.5 text-[0.6rem] tracking-luxe-sm text-white/80">
                      Découvrir
                      <ArrowRight className="size-3 transition-transform duration-500 group-hover:translate-x-1" />
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
          eyebrow="Sélection"
          title="Nos coups de cœur"
          action={{ href: "/shop", label: "Tout voir" }}
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
              La collection arrive bientôt
            </p>
            <p className="mt-2 text-sm text-muted">
              Les premières pièces seront publiées très prochainement.
            </p>
          </div>
        )}
      </section>

      <Assurances />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft radial wash — keeps the fold from reading as a flat colour block. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, var(--c-gold) 0%, transparent 55%)",
          opacity: 0.16,
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 pb-4 pt-16 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="w-52 sm:w-72"
        >
          <Logo variant="full" priority />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
          className="mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base"
        >
          Maquillage et prêt-à-porter féminin, choisis pièce par pièce.
          Livraison partout en Algérie, réglée à la réception.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/shop"
            className="btn-gold rounded-full px-9 py-3.5 text-[0.68rem] tracking-luxe-sm"
          >
            Découvrir la boutique
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.55 }}
          className="rule-fade mt-14 w-full max-w-xs"
        />
      </div>
    </section>
  );
}

function Assurances() {
  const items = [
    {
      Icon: Truck,
      title: "Livraison 58 wilayas",
      body: "À domicile ou au bureau de livraison, partout dans le pays.",
    },
    {
      Icon: BadgeCheck,
      title: "Paiement à la livraison",
      body: "Vous réglez votre commande une fois le colis entre vos mains.",
    },
    {
      Icon: Sparkles,
      title: "Sélection soignée",
      body: "Chaque pièce est choisie et vérifiée avant d'entrer en boutique.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {items.map(({ Icon, title, body }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: EASE, delay: index * 0.08 }}
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
