"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Horizontal travel, in px, that counts as a deliberate swipe. */
const SWIPE_THRESHOLD = 60;

/**
 * Direction-aware slide. `custom` carries +1 (forward) or -1 (back) down to
 * these, which is why it has to be variants rather than inline props — only
 * variants receive the custom value.
 */
const slide = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "18%" : "-18%",
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "-18%" : "18%",
  }),
};

/**
 * Product photo viewer.
 *
 * Tapping thumbnails one by one was the only way through the gallery, which is
 * awkward on a phone where the thumbnails are small. This adds the three ways
 * people actually expect to move between photos — arrows, swipe, and arrow
 * keys — while keeping the thumbnail strip for jumping straight to a shot.
 *
 * Slides travel in the direction you asked for: forward pushes the new photo in
 * from the trailing edge, back from the leading edge, which is what makes the
 * motion read as a sequence rather than a random cross-fade.
 */
export function ProductGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  /** Discount pill or similar, pinned to the top corner. */
  badge?: React.ReactNode;
}) {
  const { t, isRtl } = useI18n();
  const [[index, direction], setFrame] = useState<[number, number]>([0, 0]);
  const [zoomed, setZoomed] = useState(false);

  const count = images.length;

  const go = useCallback(
    (step: number) => {
      if (count < 2) return;
      // Wraps, so the gallery never dead-ends on the last photo.
      setFrame(([current]) => [(current + step + count) % count, step]);
    },
    [count],
  );

  const jumpTo = (next: number) =>
    setFrame(([current]) => [next, next > current ? 1 : -1]);

  useEffect(() => {
    if (count < 2) return;
    const onKey = (event: KeyboardEvent) => {
      // In RTL the left key still means "towards the start of the strip".
      if (event.key === "ArrowRight") go(isRtl ? -1 : 1);
      if (event.key === "ArrowLeft") go(isRtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, count, isRtl]);

  if (count === 0) {
    return (
      <div className="grid aspect-[3/4] place-items-center rounded-[var(--c-radius)] border border-line bg-surface">
        <span className="font-display text-6xl text-gold/30">C</span>
      </div>
    );
  }

  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-[var(--c-radius)] bg-surface">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: EASE }}
            // Swipe reads the raw drag offset; the element itself springs back.
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) go(isRtl ? -1 : 1);
              else if (info.offset.x > SWIPE_THRESHOLD) go(isRtl ? 1 : -1);
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Image
              src={images[index]}
              alt={`${alt} — ${index + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={index === 0}
              draggable={false}
              className={cn(
                "object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                zoomed && "scale-125",
              )}
            />
          </motion.div>
        </AnimatePresence>

        {badge && <div className="absolute start-4 top-4 z-10">{badge}</div>}

        {count > 1 && (
          <>
            <GalleryButton
              side="start"
              label={t("product.previousPhoto")}
              onClick={() => go(-1)}
            >
              <Prev className="size-5" strokeWidth={1.5} />
            </GalleryButton>

            <GalleryButton
              side="end"
              label={t("product.nextPhoto")}
              onClick={() => go(1)}
            >
              <Next className="size-5" strokeWidth={1.5} />
            </GalleryButton>

            {/* Position within the set, so nobody wonders how many are left. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
              <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[0.6rem] font-medium tabular-nums text-white backdrop-blur-md">
                {index + 1} / {count}
              </span>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setZoomed((v) => !v)}
          aria-label={t("product.zoom")}
          aria-pressed={zoomed}
          className={cn(
            "absolute end-4 top-4 z-10 grid size-9 place-items-center rounded-full border backdrop-blur-md transition-colors",
            zoomed
              ? "border-accent bg-accent text-accent-ink"
              : "border-white/20 bg-black/40 text-white hover:bg-black/60",
          )}
        >
          <Expand className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      {count > 1 && (
        <>
          {/* Dots on phones — a thumbnail strip is too fiddly at that size. */}
          <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={t("product.photo", { n: i + 1 })}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  i === index ? "w-6 bg-accent" : "w-1.5 bg-line",
                )}
              />
            ))}
          </div>

          <div className="no-scrollbar mt-3 hidden gap-2.5 overflow-x-auto pb-1 sm:flex">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={t("product.photo", { n: i + 1 })}
                aria-current={i === index}
                className={cn(
                  "relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-300",
                  i === index
                    ? "border-accent"
                    : "border-transparent opacity-55 hover:opacity-100",
                )}
              >
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GalleryButton({
  side,
  label,
  onClick,
  children,
}: {
  side: "start" | "end";
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full",
        "border border-white/20 bg-black/40 text-white backdrop-blur-md",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:bg-black/65 active:scale-90",
        // Always reachable by thumb on a phone; on desktop they fade in on
        // hover so they stay out of the way of the photography.
        "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100",
        side === "start" ? "start-3" : "end-3",
      )}
    >
      {children}
    </button>
  );
}
