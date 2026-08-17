"use client";

import { cn } from "@/lib/utils";

/**
 * The drifting light behind the hero.
 *
 * Three oversized radial gradients on slow, offset loops. Colours come from
 * the theme tokens, so switching to the Valentine or Emerald preset restyles
 * the background with everything else — no hard-coded hex here.
 *
 * Deliberately cheap: gradients rather than blurred boxes, and only transform
 * is animated. See the note above the keyframes in globals.css.
 */
export function AuroraBackground({
  className,
  intensity = 1,
}: {
  className?: string;
  /** Scales every blob's opacity. Lower it where content sits on top. */
  intensity?: number;
}) {
  const blobs = [
    {
      colour: "var(--c-accent)",
      size: "78vmax",
      position: { top: "-28vmax", left: "-18vmax" },
      opacity: 0.3 * intensity,
      animation: "aurora-drift-a 24s ease-in-out infinite",
    },
    {
      colour: "var(--c-gold)",
      size: "66vmax",
      position: { top: "-16vmax", right: "-22vmax" },
      opacity: 0.34 * intensity,
      animation: "aurora-drift-b 31s ease-in-out infinite",
    },
    {
      colour: "var(--c-accent)",
      size: "54vmax",
      position: { top: "18vmax", left: "22vmax" },
      opacity: 0.18 * intensity,
      animation: "aurora-drift-c 27s ease-in-out infinite",
    },
  ];

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {blobs.map((blob, index) => (
        <div
          key={index}
          className="aurora-blob"
          style={{
            ...blob.position,
            width: blob.size,
            height: blob.size,
            opacity: blob.opacity,
            animation: blob.animation,
            background: `radial-gradient(circle at 50% 50%, ${blob.colour} 0%, transparent 68%)`,
          }}
        />
      ))}

      {/* Fades the whole field into the page so it has no visible edge. */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: "linear-gradient(to top, var(--c-bg), transparent)",
        }}
      />
    </div>
  );
}

/**
 * Gold motes rising past the hero. Count is fixed and small — this is texture,
 * not a particle system, and every one is a composited 3px dot.
 */
export function FloatingMotes({ count = 14 }: { count?: number }) {
  // Deterministic pseudo-random placement: a seeded pattern keeps the server
  // and client markup identical, which Math.random() would not.
  const motes = Array.from({ length: count }, (_, i) => {
    const seed = (i * 2654435761) % 1000;
    return {
      left: `${(seed % 97) + 1}%`,
      bottom: `${(seed % 31) - 6}%`,
      size: 2 + (seed % 3),
      delay: `${(seed % 90) / 10}s`,
      duration: `${8 + (seed % 60) / 10}s`,
      drift: `${((seed % 40) - 20) * 1.4}px`,
    };
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {motes.map((mote, index) => (
        <span
          key={index}
          className="animate-mote absolute rounded-full"
          style={{
            left: mote.left,
            bottom: mote.bottom,
            width: mote.size,
            height: mote.size,
            background: "var(--c-gold)",
            ["--mote-delay" as string]: mote.delay,
            ["--mote-duration" as string]: mote.duration,
            ["--mote-drift" as string]: mote.drift,
          }}
        />
      ))}
    </div>
  );
}
