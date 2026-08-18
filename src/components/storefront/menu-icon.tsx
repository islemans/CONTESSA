"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The menu button.
 *
 * Three rules of unequal length — an editorial mark rather than the default
 * three identical bars — that even up and cross into an X when the drawer
 * opens. The middle rule is gold, which ties the control to the brand's
 * hairline motif instead of leaving a generic icon in the corner.
 *
 * Drawn rather than imported so the open/closed states are one continuous
 * animation instead of two icons swapping.
 */
export function MenuIcon({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("relative block h-4 w-6", className)}
      aria-hidden="true"
    >
      <motion.span
        className="absolute inset-x-0 top-0 block h-px origin-center bg-current"
        animate={
          open
            ? { top: "50%", rotate: 45, width: "100%" }
            : { top: 0, rotate: 0, width: "100%" }
        }
        transition={{ duration: 0.4, ease: EASE }}
      />
      {/* The gold middle rule: shorter at rest, gone once the X forms. */}
      <motion.span
        className="absolute top-1/2 block h-px -translate-y-1/2 bg-gold"
        style={{ insetInlineStart: 0 }}
        animate={
          open
            ? { width: "0%", opacity: 0 }
            : { width: "62%", opacity: 1 }
        }
        transition={{ duration: 0.3, ease: EASE }}
      />
      <motion.span
        className="absolute inset-x-0 bottom-0 block h-px origin-center bg-current"
        animate={
          open
            ? { bottom: "50%", rotate: -45, width: "100%" }
            : { bottom: 0, rotate: 0, width: "78%" }
        }
        transition={{ duration: 0.4, ease: EASE }}
      />
    </span>
  );
}
