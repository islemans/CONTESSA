import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="text-[0.6rem] tracking-luxe text-gold">Erreur 404</p>
        <h1 className="mt-4 font-display text-5xl text-ink">Page introuvable</h1>
        <p className="mt-4 text-sm text-muted">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="btn-gold mt-9 inline-block rounded-full px-9 py-3.5 text-[0.65rem] tracking-luxe-sm"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
