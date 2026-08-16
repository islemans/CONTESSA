"use client";

import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { Moon, Sun } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const settings = useQuery(api.settings.get, {});

  // The owner can take this control away from visitors entirely.
  if (settings && !settings.theme.allowUserToggle) return null;

  return (
    <button
      type="button"
      // Read at click time rather than render time — no mounted flag, and no
      // wrong icon during hydration.
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Changer de thème"
      className={cn(
        "relative grid size-9 place-items-center rounded-full border border-line",
        "text-ink transition-colors hover:border-gold hover:text-accent",
        className,
      )}
    >
      {/* CSS decides which icon shows, so the server and client agree. */}
      <Sun
        className="size-4 rotate-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:hidden"
        strokeWidth={1.5}
      />
      <Moon
        className="hidden size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:block"
        strokeWidth={1.5}
      />
    </button>
  );
}
