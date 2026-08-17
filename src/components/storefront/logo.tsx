"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Both logo files are rendered and CSS picks one.
 *
 * Reading the theme in JS would need a mounted flag — the server can't know
 * the mode — and that shows the wrong artwork for a frame on every load. The
 * `dark` class is already on <html> before first paint, so letting CSS decide
 * is both instant and flash-free.
 *
 * The files are JPEGs with baked-in backgrounds (white for the light artwork,
 * black for the dark one). Blend modes knock those out so the mark sits on the
 * page instead of in a box:
 *   multiply — white disappears against a light canvas
 *   screen   — black disappears against a dark canvas
 * Swap in transparent PNGs later and the blend simply becomes a no-op.
 */
export function Logo({
  variant = "full",
  className,
  priority = false,
}: {
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
}) {
  if (variant === "mark") {
    return (
      <span
        className={cn(
          "relative block aspect-square overflow-hidden rounded-full",
          className,
        )}
      >
        <Image
          src="/brand/logo-light.jpg"
          alt="Contessa"
          fill
          sizes="64px"
          priority={priority}
          // Zooms past the wordmark onto the crowned silhouette.
          className="scale-[1.72] object-cover object-[50%_26%] mix-blend-multiply dark:hidden"
        />
        <Image
          src="/brand/logo-dark.jpg"
          alt="Contessa"
          fill
          sizes="64px"
          priority={priority}
          className="hidden scale-[1.72] object-cover object-[50%_26%] mix-blend-screen dark:block"
        />
      </span>
    );
  }

  return (
    <span className={cn("relative block", className)}>
      <Image
        src="/brand/logo-light.jpg"
        alt="Contessa"
        width={1400}
        height={1130}
        priority={priority}
        className="h-auto w-full object-contain mix-blend-multiply dark:hidden"
      />
      <Image
        src="/brand/logo-dark.jpg"
        alt="Contessa"
        width={1400}
        height={1130}
        priority={priority}
        className="hidden h-auto w-full object-contain mix-blend-screen dark:block"
      />
    </span>
  );
}

export function LogoLockup({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <Link
      href="/"
      aria-label={t("nav.home")}
      className={cn("group flex items-center gap-2.5", className)}
    >
      <Logo variant="mark" className="w-9 shrink-0 sm:w-10" priority />
      <span className="flex flex-col leading-none">
        {/* Always Latin: the wordmark is the brand, not translated copy. */}
        <span className="font-display text-[1.05rem] tracking-luxe text-ink transition-colors group-hover:text-accent sm:text-xl">
          Contessa
        </span>
        <span className="mt-1 hidden text-[0.5rem] tracking-luxe-sm text-muted sm:block">
          {t("hero.tagline")}
        </span>
      </span>
    </Link>
  );
}
