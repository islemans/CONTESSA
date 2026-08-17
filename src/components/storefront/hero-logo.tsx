"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The hero treatment of the mark: it settles in on load, breathes, and a band
 * of light passes over it every few seconds like foil catching the light.
 *
 * Both artwork files are rendered and CSS chooses — same reasoning as `Logo`.
 * Deciding in JS would need a mounted flag and would flash the wrong one.
 */
export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Expanding rings, offset so there is always one mid-flight. */}
      <div aria-hidden className="absolute inset-0 grid place-items-center">
        {[0, 1.6, 3.2].map((delay) => (
          <span
            key={delay}
            className="animate-halo absolute aspect-square w-[78%] rounded-full border"
            style={{
              borderColor: "var(--c-gold)",
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: EASE }}
        className="relative"
      >
        {/* Float lives on its own element so it can't fight the entrance. */}
        <div className="animate-logo-float relative">
          <span className="relative block overflow-hidden">
            <Image
              src="/brand/logo-light.jpg"
              alt="Contessa"
              width={1400}
              height={1130}
              priority
              className="h-auto w-full object-contain mix-blend-multiply dark:hidden"
            />
            <Image
              src="/brand/logo-dark.jpg"
              alt="Contessa"
              width={1400}
              height={1130}
              priority
              className="hidden h-auto w-full object-contain mix-blend-screen dark:block"
            />

            {/* The travelling highlight. */}
            <span
              aria-hidden
              className="animate-logo-sheen absolute inset-y-0 w-1/3 mix-blend-overlay"
              style={{
                background:
                  "linear-gradient(100deg, transparent, var(--c-gold), transparent)",
              }}
            />
          </span>
        </div>
      </motion.div>
    </div>
  );
}
