"use client";

import { useEffect, useMemo } from "react";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { api } from "@cvx/_generated/api";
import { CartProvider } from "@/lib/cart";
import { themeCss, type ThemeConfig } from "@/lib/theme-css";

/**
 * Created once at module scope. A client per render would tear down and
 * rebuild the websocket on every navigation.
 */
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

/**
 * Keeps the live palette in sync with the dashboard. The server already
 * emitted the correct CSS; this only re-writes it when the owner edits a
 * colour, so the change lands without a refresh.
 */
function ThemeBridge() {
  const settings = useQuery(api.settings.get, {});
  const { setTheme } = useTheme();

  const theme = settings?.theme as ThemeConfig | undefined;
  const css = useMemo(() => (theme ? themeCss(theme) : null), [theme]);

  useEffect(() => {
    if (!css) return;
    const id = "contessa-theme-live";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, [css]);

  // When the owner locks the theme, drag every visitor back to their choice.
  useEffect(() => {
    if (theme && !theme.allowUserToggle) setTheme(theme.defaultMode);
  }, [theme, setTheme]);

  return null;
}

export function Providers({
  children,
  defaultMode,
}: {
  children: React.ReactNode;
  defaultMode: "light" | "dark";
}) {
  const tree = (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultMode}
      enableSystem={false}
      disableTransitionOnChange
    >
      <CartProvider>
        {convex ? <ThemeBridge /> : null}
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--c-surface)",
              color: "var(--c-ink)",
              border: "1px solid var(--c-border)",
              borderRadius: "var(--c-radius)",
              fontFamily: "var(--font-body-sans)",
            },
          }}
        />
      </CartProvider>
    </ThemeProvider>
  );

  // Without a deployment URL the app still renders; only live data is missing.
  return convex ? <ConvexProvider client={convex}>{tree}</ConvexProvider> : tree;
}
