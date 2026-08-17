"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="text-[0.6rem] tracking-luxe text-gold">
          {t("notFound.eyebrow")}
        </p>
        <h1 className="mt-4 font-display text-5xl text-ink">
          {t("notFound.title")}
        </h1>
        <p className="mt-4 text-sm text-muted">{t("notFound.body")}</p>
        <Link
          href="/"
          className="btn-gold mt-9 inline-block rounded-full px-9 py-3.5 text-[0.65rem] tracking-luxe-sm"
        >
          {t("notFound.cta")}
        </Link>
      </div>
    </div>
  );
}
