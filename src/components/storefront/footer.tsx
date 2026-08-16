"use client";

import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { Phone, Mail } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { Logo } from "./logo";
import { ADMIN_PATH } from "@/lib/admin-path";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "./social-icons";

export function Footer() {
  const settings = useQuery(api.settings.get, {});
  const categories = useQuery(api.categories.list, {});

  const socials = [
    { href: settings?.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: settings?.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: settings?.tiktok, Icon: TiktokIcon, label: "TikTok" },
  ].filter((s): s is { href: string; Icon: typeof InstagramIcon; label: string } =>
    Boolean(s.href),
  );

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo variant="full" className="w-40 sm:w-48" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Maquillage et vêtements choisis pour celles qui aiment le détail.
              Livraison vers toutes les wilayas, paiement à la livraison.
            </p>

            {socials.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socials.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full border border-line text-ink transition-colors hover:border-gold hover:text-accent"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-[0.65rem] tracking-luxe text-gold">Boutique</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                  Tout voir
                </Link>
              </li>
              {categories?.slice(0, 6).map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/shop?c=${category.slug}`}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[0.65rem] tracking-luxe text-gold">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {settings?.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-2 transition-colors hover:text-accent"
                  >
                    <Phone className="size-3.5" strokeWidth={1.5} />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-2 transition-colors hover:text-accent"
                  >
                    <Mail className="size-3.5" strokeWidth={1.5} />
                    {settings.email}
                  </a>
                </li>
              )}
              <li>Livraison à domicile ou au bureau</li>
              <li>Paiement à la livraison</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 border-t border-line pt-8 sm:flex-row sm:justify-between">
          <p className="text-[0.65rem] tracking-luxe-sm text-muted">
            © {new Date().getFullYear()} {settings?.siteName ?? "Contessa"}
          </p>
          <SecretDoor />
        </div>
      </div>
    </footer>
  );
}

/**
 * The secret door.
 *
 * Five taps on the ornament within three seconds opens the dashboard login.
 * It reads as decoration, works with a thumb, and leaves no link for a crawler
 * to follow. The real protection is the password behind it — this only keeps
 * the entrance off the page.
 */
function SecretDoor() {
  const router = useRouter();
  const taps = useRef<number[]>([]);

  const handleTap = () => {
    const now = Date.now();
    taps.current = [...taps.current, now].filter((t) => now - t < 3000);
    if (taps.current.length >= 5) {
      taps.current = [];
      router.push(ADMIN_PATH);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-hidden="true"
      tabIndex={-1}
      className="select-none px-6 py-2 text-gold/60 transition-colors hover:text-gold"
      title=""
    >
      <svg width="44" height="10" viewBox="0 0 44 10" fill="none" aria-hidden="true">
        <path d="M0 5h16M28 5h16" stroke="currentColor" strokeWidth="0.75" />
        <path
          d="M22 0.5 24 5l-2 4.5L20 5z"
          stroke="currentColor"
          strokeWidth="0.75"
          fill="none"
        />
      </svg>
    </button>
  );
}
