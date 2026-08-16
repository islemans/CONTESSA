"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-end justify-between gap-6"
    >
      <div>
        {eyebrow && (
          <p className="text-[0.6rem] tracking-luxe text-gold">{eyebrow}</p>
        )}
        <h2 className="mt-2.5 font-display text-3xl leading-tight text-ink sm:text-4xl">
          {title}
        </h2>
        <div className="mt-4 h-px w-14 bg-gold" />
      </div>

      {action && (
        <Link
          href={action.href}
          className="group hidden shrink-0 items-center gap-1.5 pb-1 text-[0.62rem] tracking-luxe-sm text-muted transition-colors hover:text-accent sm:flex"
        >
          {action.label}
          <ArrowRight className="size-3 transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      )}
    </motion.div>
  );
}
