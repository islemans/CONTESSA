"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  X,
} from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useAdminSession } from "@/lib/admin-session";
import { ADMIN_PATH } from "@/lib/admin-path";
import { Logo } from "@/components/storefront/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "", label: "Aperçu", Icon: LayoutGrid },
  { href: "/orders", label: "Commandes", Icon: ShoppingCart },
  { href: "/products", label: "Produits", Icon: Package },
  { href: "/categories", label: "Catégories", Icon: Tags },
  { href: "/delivery", label: "Livraison", Icon: Truck },
  { href: "/theme", label: "Thème", Icon: Palette },
  { href: "/settings", label: "Réglages", Icon: Settings },
];

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, token, signOut } = useAdminSession();
  const logout = useMutation(api.admin.logout);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (authenticated === false) router.replace(ADMIN_PATH);
  }, [authenticated, router]);

  useEffect(() => setNavOpen(false), [pathname]);

  if (authenticated !== true) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg">
        <div className="size-8 animate-spin rounded-full border-2 border-line border-t-gold" />
      </div>
    );
  }

  const handleSignOut = async () => {
    // Drop the local session even if the server call fails — the owner asked
    // to be signed out, and the token expires on its own regardless.
    if (token) await logout({ token }).catch(() => undefined);
    signOut();
    router.replace(ADMIN_PATH);
  };

  const base = `${ADMIN_PATH}/dashboard`;

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:flex lg:h-dvh lg:flex-col lg:sticky lg:top-0">
        <SidebarContent
          base={base}
          pathname={pathname}
          onSignOut={handleSignOut}
        />
      </aside>

      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Ouvrir le menu"
          className="grid size-10 place-items-center text-ink"
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </button>
        <span className="font-display text-lg tracking-luxe text-ink">
          Atelier
        </span>
        <Link
          href="/"
          target="_blank"
          aria-label="Voir la boutique"
          className="grid size-10 place-items-center text-muted"
        >
          <ExternalLink className="size-4" strokeWidth={1.5} />
        </Link>
      </div>

      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                aria-label="Fermer le menu"
                className="absolute right-3 top-3 grid size-9 place-items-center text-muted"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
              <SidebarContent
                base={base}
                pathname={pathname}
                onSignOut={handleSignOut}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}

function SidebarContent({
  base,
  pathname,
  onSignOut,
}: {
  base: string;
  pathname: string;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="border-b border-line px-5 py-6">
        <Logo variant="full" className="w-28" />
        <p className="mt-3 text-[0.55rem] tracking-luxe text-gold">
          Tableau de bord
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ href, label, Icon }) => {
          const target = `${base}${href}`;
          const active =
            href === "" ? pathname === target : pathname.startsWith(target);

          return (
            <Link
              key={href}
              href={target}
              className={cn(
                "flex items-center gap-3 rounded-[var(--c-radius)] px-3.5 py-2.5 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-ink"
                  : "text-muted hover:bg-bg hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-line p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-[var(--c-radius)] px-3.5 py-2.5 text-sm text-muted transition-colors hover:bg-bg hover:text-ink"
        >
          <ExternalLink className="size-4 shrink-0" strokeWidth={1.5} />
          Voir la boutique
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-[var(--c-radius)] px-3.5 py-2.5 text-sm text-muted transition-colors hover:bg-bg hover:text-ink"
        >
          <LogOut className="size-4 shrink-0" strokeWidth={1.5} />
          Se déconnecter
        </button>
      </div>
    </>
  );
}
