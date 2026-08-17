"use client";

import { useQuery } from "convex/react";
import { Moon } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useI18n } from "@/lib/i18n/provider";

/** Shown when the owner pauses the shop from the dashboard. */
export function StoreClosedNotice() {
  const { t } = useI18n();
  const settings = useQuery(api.settings.get, {});
  if (!settings || settings.storeOpen) return null;

  return (
    <div className="border-b border-line bg-surface">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-3 text-center text-xs text-muted">
        <Moon className="size-3.5 shrink-0 text-gold" strokeWidth={1.5} />
        {t("store.closed")}
      </p>
    </div>
  );
}
