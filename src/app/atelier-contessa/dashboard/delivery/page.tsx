"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Building2, Home, RotateCcw, Search, Wand2 } from "lucide-react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useAdminSession } from "@/lib/admin-session";
import { cleanConvexError } from "@/lib/errors";
import {
  Button,
  Card,
  PageHeader,
  TableSkeleton,
  fieldClass,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

type Row = {
  id: Id<"wilayas">;
  code: number;
  name: string;
  nameAr: string;
  homePrice: number;
  deskPrice: number;
  homeAvailable: boolean;
  deskAvailable: boolean;
  isActive: boolean;
};

export default function DeliveryPage() {
  const { t, money } = useI18n();
  const { token } = useAdminSession();
  const wilayas = useQuery(api.wilayas.listAll, token ? { token } : "skip");
  const bulkUpdate = useMutation(api.wilayas.bulkUpdate);
  const restoreOfficial = useMutation(api.wilayas.restoreOfficialList);

  const [rows, setRows] = useState<Row[]>([]);
  const [term, setTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [bulkHome, setBulkHome] = useState("");
  const [bulkDesk, setBulkDesk] = useState("");

  // Edits live locally until "Enregistrer" — typing 58 rows shouldn't fire
  // 58 round-trips, and the owner can back out of a mistake.
  useEffect(() => {
    if (!wilayas) return;
    setRows(
      wilayas.map((w) => ({
        id: w._id,
        code: w.code,
        name: w.name,
        nameAr: w.nameAr,
        homePrice: w.homePrice,
        deskPrice: w.deskPrice,
        homeAvailable: w.homeAvailable,
        deskAvailable: w.deskAvailable,
        isActive: w.isActive,
      })),
    );
  }, [wilayas]);

  const dirty = useMemo(() => {
    if (!wilayas) return false;
    return rows.some((row) => {
      const original = wilayas.find((w) => w._id === row.id);
      if (!original) return false;
      return (
        original.homePrice !== row.homePrice ||
        original.deskPrice !== row.deskPrice ||
        original.homeAvailable !== row.homeAvailable ||
        original.deskAvailable !== row.deskAvailable ||
        original.isActive !== row.isActive
      );
    });
  }, [rows, wilayas]);

  const visible = rows.filter((row) => {
    const needle = term.trim().toLowerCase();
    if (!needle) return true;
    return (
      row.name.toLowerCase().includes(needle) ||
      row.nameAr.includes(needle) ||
      String(row.code).padStart(2, "0").includes(needle)
    );
  });

  const patch = (id: Id<"wilayas">, changes: Partial<Row>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    );
  };

  const handleSave = async () => {
    if (!token || saving) return;
    setSaving(true);
    try {
      await bulkUpdate({
        token,
        rows: rows.map(({ id, homePrice, deskPrice, homeAvailable, deskAvailable, isActive }) => ({
          id,
          homePrice: Math.max(0, Math.round(homePrice) || 0),
          deskPrice: Math.max(0, Math.round(deskPrice) || 0),
          homeAvailable,
          deskAvailable,
          isActive,
        })),
      });
      toast.success(t("a.delivery.saved"));
    } catch (error) {
      toast.error(cleanConvexError(error));
    } finally {
      setSaving(false);
    }
  };

  const applyBulk = () => {
    const home = bulkHome === "" ? null : Number(bulkHome);
    const desk = bulkDesk === "" ? null : Number(bulkDesk);
    if (home === null && desk === null) {
      toast.error(t("a.delivery.needPrice"));
      return;
    }
    setRows((current) =>
      current.map((row) => ({
        ...row,
        homePrice: home ?? row.homePrice,
        deskPrice: desk ?? row.deskPrice,
      })),
    );
    setBulkHome("");
    setBulkDesk("");
    toast.success(t("a.delivery.applied"));
  };

  const handleRestore = async () => {
    if (!token) return;
    try {
      const added = await restoreOfficial({ token });
      toast.success(
        added === 0
          ? t("a.delivery.alreadyComplete")
          : t("a.delivery.restored", { n: added }),
      );
    } catch (error) {
      toast.error(cleanConvexError(error));
    }
  };

  const averageHome = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.homePrice, 0) / rows.length)
    : 0;
  const averageDesk = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.deskPrice, 0) / rows.length)
    : 0;

  return (
    <>
      <PageHeader
        eyebrow={t("a.nav.atelier")}
        title={t("a.nav.delivery")}
        description={t("a.delivery.description")}
        action={
          <Button variant="ghost" onClick={handleRestore}>
            <RotateCcw className="size-3.5" strokeWidth={1.5} />
            {t("a.delivery.restore")}
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-[0.55rem] tracking-luxe-sm text-muted">
            {t("a.delivery.activeWilayas")}
          </p>
          <p className="mt-3 font-display text-2xl text-ink">
            {rows.filter((r) => r.isActive).length}
            <span className="text-base text-muted"> / {rows.length}</span>
          </p>
        </Card>
        <Card>
          <p className="text-[0.55rem] tracking-luxe-sm text-muted">
            {t("a.delivery.avgHome")}
          </p>
          <p className="mt-3 font-display text-2xl text-ink">
            {money(averageHome)}
          </p>
        </Card>
        <Card>
          <p className="text-[0.55rem] tracking-luxe-sm text-muted">
            {t("a.delivery.avgDesk")}
          </p>
          <p className="mt-3 font-display text-2xl text-ink">
            {money(averageDesk)}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="flex items-center gap-2 text-[0.6rem] tracking-luxe text-gold">
          <Wand2 className="size-3.5" strokeWidth={1.5} />
          {t("a.delivery.flatRate")}
        </h2>
        <p className="mt-2 text-xs text-muted">{t("a.delivery.flatRateBody")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={bulkHome}
            onChange={(e) => setBulkHome(e.target.value)}
            placeholder={t("a.delivery.homePlaceholder")}
            className={`${fieldClass} sm:w-44`}
          />
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={bulkDesk}
            onChange={(e) => setBulkDesk(e.target.value)}
            placeholder={t("a.delivery.deskPlaceholder")}
            className={`${fieldClass} sm:w-44`}
          />
          <Button type="button" variant="ghost" onClick={applyBulk}>
            {t("a.delivery.applyAll")}
          </Button>
        </div>
      </Card>

      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
          strokeWidth={1.5}
        />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t("a.delivery.search")}
          className={`${fieldClass} pl-11`}
        />
      </div>

      {wilayas === undefined ? (
        <TableSkeleton rows={6} />
      ) : rows.length === 0 ? (
        <Card>
          <p className="text-sm text-ink">{t("a.delivery.noneRegistered")}</p>
          <code className="mt-3 block rounded-[var(--c-radius)] border border-line bg-bg px-4 py-3 text-xs text-accent">
            npx convex run seed:init
          </code>
          <p className="mt-3 text-xs text-muted">{t("a.delivery.orRestore")}</p>
        </Card>
      ) : (
        <div className="space-y-2 pb-28">
          {visible.map((row) => (
            <div
              key={row.id}
              className={cn(
                "surface-card p-4 transition-opacity",
                !row.isActive && "opacity-50",
              )}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-32 flex-1">
                  <p className="text-sm text-ink">
                    <span className="text-gold">
                      {String(row.code).padStart(2, "0")}
                    </span>{" "}
                    {row.name}
                  </p>
                  {row.nameAr && (
                    <p className="text-xs text-muted" dir="rtl">
                      {row.nameAr}
                    </p>
                  )}
                </div>

                <PriceInput
                  Icon={Home}
                  label={t("a.delivery.home")}
                  value={row.homePrice}
                  available={row.homeAvailable}
                  onValue={(homePrice) => patch(row.id, { homePrice })}
                  onToggle={() =>
                    patch(row.id, { homeAvailable: !row.homeAvailable })
                  }
                />

                <PriceInput
                  Icon={Building2}
                  label={t("a.delivery.desk")}
                  value={row.deskPrice}
                  available={row.deskAvailable}
                  onValue={(deskPrice) => patch(row.id, { deskPrice })}
                  onToggle={() =>
                    patch(row.id, { deskAvailable: !row.deskAvailable })
                  }
                />

                <button
                  type="button"
                  onClick={() => patch(row.id, { isActive: !row.isActive })}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-[0.55rem] tracking-luxe-sm transition-colors",
                    row.isActive
                      ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      : "border-line text-muted",
                  )}
                >
                  {row.isActive
                    ? t("a.delivery.served")
                    : t("a.delivery.notServed")}
                </button>
              </div>
            </div>
          ))}

          {visible.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">
              {t("a.delivery.noMatch", { term })}
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 px-4 py-4 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
              <p className="text-xs text-muted">{t("a.delivery.unsaved")}</p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!wilayas) return;
                    setRows(
                      wilayas.map((w) => ({
                        id: w._id,
                        code: w.code,
                        name: w.name,
                        nameAr: w.nameAr,
                        homePrice: w.homePrice,
                        deskPrice: w.deskPrice,
                        homeAvailable: w.homeAvailable,
                        deskAvailable: w.deskAvailable,
                        isActive: w.isActive,
                      })),
                    );
                  }}
                >
                  {t("a.cancel")}
                </Button>
                <Button onClick={handleSave} loading={saving}>
                  {t("a.save")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PriceInput({
  Icon,
  label,
  value,
  available,
  onValue,
  onToggle,
}: {
  Icon: typeof Home;
  label: string;
  value: number;
  available: boolean;
  onValue: (next: number) => void;
  onToggle: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          available
            ? t("a.delivery.available", { mode: label })
            : t("a.delivery.unavailable", { mode: label })
        }
        title={
          available
            ? t("a.delivery.available", { mode: label })
            : t("a.delivery.unavailable", { mode: label })
        }
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border transition-colors",
          available
            ? "border-accent text-accent"
            : "border-line text-muted line-through",
        )}
      >
        <Icon className="size-4" strokeWidth={1.5} />
      </button>
      <div className="relative">
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          disabled={!available}
          onChange={(event) => onValue(Number(event.target.value))}
          aria-label={t("a.delivery.rateFor", { mode: label })}
          className="w-24 rounded-[var(--c-radius)] border border-line bg-bg py-2 pl-3 pr-8 text-sm text-ink transition-colors focus:border-gold focus:outline-none disabled:opacity-40"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] text-muted">
          DA
        </span>
      </div>
    </div>
  );
}
