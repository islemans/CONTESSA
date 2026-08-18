"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useAdminSession } from "@/lib/admin-session";
import { cleanConvexError } from "@/lib/errors";
import { useI18n } from "@/lib/i18n/provider";
import {
  Button,
  Card,
  Field,
  PageHeader,
  Toggle,
  fieldClass,
} from "@/components/admin/ui";

export default function SettingsPage() {
  const { t } = useI18n();
  const { token, signOut } = useAdminSession();
  const settings = useQuery(api.settings.get, {});
  const updateSettings = useMutation(api.settings.update);
  const changePassword = useMutation(api.admin.changePassword);

  const [form, setForm] = useState({
    siteName: "",
    tagline: "",
    announcement: "",
    announcementActive: true,
    phone: "",
    email: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    storeOpen: true,
    freeDeliveryThreshold: "0",
  });
  const [saving, setSaving] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setForm({
      siteName: settings.siteName,
      tagline: settings.tagline,
      announcement: settings.announcement,
      announcementActive: settings.announcementActive,
      phone: settings.phone,
      email: settings.email,
      instagram: settings.instagram,
      facebook: settings.facebook,
      tiktok: settings.tiktok,
      storeOpen: settings.storeOpen,
      freeDeliveryThreshold: String(settings.freeDeliveryThreshold),
    });
  }, [settings]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || saving) return;

    setSaving(true);
    try {
      await updateSettings({
        token,
        ...form,
        freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
      });
      toast.success(t("a.settings.saved"));
    } catch (error) {
      toast.error(cleanConvexError(error));
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || changing) return;

    if (next !== confirm) {
      toast.error(t("a.login.mismatch"));
      return;
    }

    setChanging(true);
    try {
      await changePassword({ token, current, next });
      toast.success(t("a.settings.changed"));
      // The server revoked every session, including this one.
      signOut();
    } catch (error) {
      toast.error(cleanConvexError(error));
      setChanging(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={t("a.nav.atelier")}
        title={t("a.nav.settings")}
        description={t("a.settings.description")}
      />

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-[0.6rem] tracking-luxe text-gold">
            {t("a.settings.identity")}
          </h2>
          <div className="mt-5 space-y-5">
            <Field label={t("a.settings.siteName")}>
              <input
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label={t("a.settings.tagline")}>
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder={t("hero.tagline")}
                className={fieldClass}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-[0.6rem] tracking-luxe text-gold">
            {t("a.settings.banner")}
          </h2>
          <div className="mt-5 space-y-5">
            <Field
              label={t("a.settings.announcement")}
              hint={t("a.settings.announcementHint")}
            >
              <input
                value={form.announcement}
                onChange={(e) =>
                  setForm({ ...form, announcement: e.target.value })
                }
                placeholder={t("a.settings.announcementPlaceholder")}
                className={fieldClass}
              />
            </Field>
            <Toggle
              checked={form.announcementActive}
              onChange={(announcementActive) =>
                setForm({ ...form, announcementActive })
              }
              label={t("a.settings.showBanner")}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-[0.6rem] tracking-luxe text-gold">
            {t("a.settings.contact")}
          </h2>
          <div className="mt-5 space-y-5">
            <Field label={t("a.settings.phone")}>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0551234567"
                className={fieldClass}
              />
            </Field>
            <Field label={t("a.settings.email")}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label={t("a.settings.instagram")} hint={t("a.settings.fullLink")}>
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/contessa"
                className={fieldClass}
              />
            </Field>
            <Field label={t("a.settings.facebook")} hint={t("a.settings.fullLink")}>
              <input
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label={t("a.settings.tiktok")} hint={t("a.settings.fullLink")}>
              <input
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                className={fieldClass}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-[0.6rem] tracking-luxe text-gold">
            {t("a.settings.ordersSection")}
          </h2>
          <div className="mt-5 space-y-5">
            <Toggle
              checked={form.storeOpen}
              onChange={(storeOpen) => setForm({ ...form, storeOpen })}
              label={t("a.settings.storeOpen")}
              hint={t("a.settings.storeOpenHint")}
            />
            <Field
              label={t("a.settings.freeThreshold")}
              hint={t("a.settings.freeThresholdHint")}
            >
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={form.freeDeliveryThreshold}
                onChange={(e) =>
                  setForm({ ...form, freeDeliveryThreshold: e.target.value })
                }
                className={fieldClass}
              />
            </Field>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Button type="submit" loading={saving}>
            {t("a.settings.saveButton")}
          </Button>
        </div>
      </form>

      <Card className="mt-6 max-w-lg">
        <h2 className="flex items-center gap-2 text-[0.6rem] tracking-luxe text-gold">
          <KeyRound className="size-3.5" strokeWidth={1.5} />
          {t("a.settings.password")}
        </h2>
        <p className="mt-2 text-xs text-muted">
          {t("a.settings.passwordBody")}
        </p>

        <form onSubmit={handlePassword} className="mt-5 space-y-5">
          <Field label={t("a.settings.current")} required>
            <input
              required
              type="password"
              value={current}
              autoComplete="current-password"
              onChange={(e) => setCurrent(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field
            label={t("a.settings.newPassword")}
            required
            hint={t("a.settings.newPasswordHint")}
          >
            <input
              required
              type="password"
              minLength={8}
              value={next}
              autoComplete="new-password"
              onChange={(e) => setNext(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label={t("a.settings.confirmPassword")} required>
            <input
              required
              type="password"
              minLength={8}
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Button type="submit" variant="ghost" loading={changing}>
            {t("a.settings.changeButton")}
          </Button>
        </form>
      </Card>
    </>
  );
}
