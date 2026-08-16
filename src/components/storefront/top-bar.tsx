"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "convex/react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useCart } from "@/lib/cart";
import { cn, formatDA } from "@/lib/utils";
import { LogoLockup } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const EASE = [0.22, 1, 0.36, 1] as const;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function TopBar() {
  const pathname = usePathname();
  const settings = useQuery(api.settings.get, {});
  const categories = useQuery(api.categories.list, {});
  const { count } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Subscribing rather than storing in state means a page restored mid-scroll
  // renders with the condensed bar immediately, without waiting for an event.
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 8,
    () => false,
  );

  // A drawer left open across a navigation would trap the customer.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Freeze the page behind the drawer — iOS Safari scrolls it otherwise.
  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  const showAnnouncement =
    settings?.announcementActive && settings.announcement.trim().length > 0;

  return (
    <>
      <header className="sticky top-0 z-50">
        {showAnnouncement && (
          <div className="overflow-hidden bg-gradient-to-r from-accent via-gold to-accent">
            <p className="px-4 py-1.5 text-center text-[0.6rem] font-medium tracking-luxe-sm text-accent-ink sm:text-[0.65rem]">
              {settings.announcement}
            </p>
          </div>
        )}

        <div
          className={cn(
            "border-b transition-all duration-500",
            scrolled
              ? "border-line bg-surface/85 backdrop-blur-xl"
              : "border-transparent bg-bg",
          )}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="-ml-2 grid size-10 place-items-center text-ink lg:hidden"
            >
              <Menu className="size-5" strokeWidth={1.5} />
            </button>

            <LogoLockup className="lg:flex-none" />

            <nav className="hidden items-center gap-8 lg:flex">
              <NavLink href="/shop" active={pathname === "/shop"}>
                Boutique
              </NavLink>
              {categories?.slice(0, 4).map((category) => (
                <NavLink
                  key={category._id}
                  href={`/shop?c=${category.slug}`}
                  active={false}
                >
                  {category.name}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Rechercher"
                className="grid size-9 place-items-center rounded-full text-ink transition-colors hover:text-accent"
              >
                <Search className="size-[1.15rem]" strokeWidth={1.5} />
              </button>

              <ThemeToggle className="hidden sm:grid" />

              <Link
                href="/cart"
                aria-label={`Panier, ${count} article${count === 1 ? "" : "s"}`}
                className="relative grid size-9 place-items-center rounded-full text-ink transition-colors hover:text-accent"
              >
                <ShoppingBag className="size-[1.15rem]" strokeWidth={1.5} />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="absolute -right-0.5 -top-0.5 grid min-w-[1.1rem] place-items-center rounded-full bg-accent px-1 text-[0.6rem] font-semibold text-accent-ink"
                    >
                      {count > 99 ? "99+" : count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories ?? []}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative py-1 text-[0.7rem] tracking-luxe-sm transition-colors",
        active ? "text-accent" : "text-ink hover:text-accent",
      )}
    >
      {children}
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active ? "w-full" : "w-0 group-hover:w-full",
        )}
      />
    </Link>
  );
}

function MobileDrawer({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: { _id: string; name: string; slug: string; imageUrl: string | null }[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] lg:hidden"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.42, ease: EASE }}
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-bg shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-display text-lg tracking-luxe">Menu</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le menu"
                className="grid size-9 place-items-center rounded-full text-ink"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <Link
                href="/shop"
                className="block border-b border-line py-4 font-display text-2xl text-ink"
              >
                Toute la boutique
              </Link>

              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * index + 0.1, duration: 0.4, ease: EASE }}
                >
                  <Link
                    href={`/shop?c=${category.slug}`}
                    className="flex items-center gap-4 border-b border-line py-4"
                  >
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt=""
                        width={48}
                        height={64}
                        className="h-16 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <span className="grid h-16 w-12 place-items-center rounded-md border border-line font-display text-lg text-gold">
                        {category.name.charAt(0)}
                      </span>
                    )}
                    <span className="font-display text-xl text-ink">
                      {category.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center justify-between border-t border-line px-5 py-4">
              <span className="text-[0.65rem] tracking-luxe-sm text-muted">
                Thème
              </span>
              <ThemeToggle />
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState("");
  // "skip" keeps Convex from firing a query for every keystroke under 2 chars.
  const results = useQuery(
    api.products.search,
    term.trim().length >= 2 ? { term } : "skip",
  );

  // Clearing on the way out beats an effect watching `open`: this component
  // stays mounted so AnimatePresence can play the exit transition.
  const close = () => {
    setTerm("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] bg-bg/95 backdrop-blur-xl"
        >
          <div className="mx-auto flex h-full max-w-2xl flex-col px-4 pt-6 sm:pt-16">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <Search className="size-5 shrink-0 text-muted" strokeWidth={1.5} />
              <input
                autoFocus
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Rechercher un produit…"
                className="w-full bg-transparent font-display text-2xl text-ink placeholder:text-muted focus:outline-none sm:text-3xl"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Fermer la recherche"
                className="grid size-9 shrink-0 place-items-center rounded-full text-ink"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
              {term.trim().length >= 2 && results?.length === 0 && (
                <p className="py-12 text-center text-sm text-muted">
                  Aucun résultat pour « {term} ».
                </p>
              )}

              <div className="grid gap-3">
                {results?.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug}`}
                    className="flex items-center gap-4 rounded-[var(--c-radius)] border border-line bg-surface p-3 transition-colors hover:border-gold"
                  >
                    {product.coverUrl ? (
                      <Image
                        src={product.coverUrl}
                        alt=""
                        width={60}
                        height={80}
                        className="h-20 w-15 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <span className="h-20 w-15 shrink-0 rounded-md bg-bg" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-lg text-ink">
                        {product.name}
                      </span>
                      <span className="text-xs tracking-luxe-sm text-muted">
                        {product.categoryName}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium text-accent">
                      {formatDA(product.price)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
