"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { useAdminSession } from "@/lib/admin-session";
import { cleanConvexError } from "@/lib/errors";
import {
  Button,
  Card,
  Field,
  PageHeader,
  Toggle,
  fieldClass,
} from "@/components/admin/ui";

export default function SettingsPage() {
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
      toast.success("Réglages enregistrés");
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
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setChanging(true);
    try {
      await changePassword({ token, current, next });
      toast.success("Mot de passe modifié — reconnectez-vous.");
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
        eyebrow="Configuration"
        title="Réglages"
        description="Identité de la boutique, coordonnées, bandeau d'annonce et sécurité."
      />

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-[0.6rem] tracking-luxe text-gold">Identité</h2>
          <div className="mt-5 space-y-5">
            <Field label="Nom de la boutique">
              <input
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="Slogan">
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Beauté & Élégance"
                className={fieldClass}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-[0.6rem] tracking-luxe text-gold">Bandeau</h2>
          <div className="mt-5 space-y-5">
            <Field
              label="Message d'annonce"
              hint="La bande dorée tout en haut du site."
            >
              <input
                value={form.announcement}
                onChange={(e) =>
                  setForm({ ...form, announcement: e.target.value })
                }
                placeholder="Livraison offerte dès 8000 DA"
                className={fieldClass}
              />
            </Field>
            <Toggle
              checked={form.announcementActive}
              onChange={(announcementActive) =>
                setForm({ ...form, announcementActive })
              }
              label="Afficher le bandeau"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-[0.6rem] tracking-luxe text-gold">Contact</h2>
          <div className="mt-5 space-y-5">
            <Field label="Téléphone">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0551234567"
                className={fieldClass}
              />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="Instagram" hint="Lien complet">
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/contessa"
                className={fieldClass}
              />
            </Field>
            <Field label="Facebook" hint="Lien complet">
              <input
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="TikTok" hint="Lien complet">
              <input
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                className={fieldClass}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-[0.6rem] tracking-luxe text-gold">Commandes</h2>
          <div className="mt-5 space-y-5">
            <Toggle
              checked={form.storeOpen}
              onChange={(storeOpen) => setForm({ ...form, storeOpen })}
              label="Boutique ouverte"
              hint="Fermée, le catalogue reste visible mais personne ne peut commander."
            />
            <Field
              label="Livraison offerte à partir de (DA)"
              hint="Mettez 0 pour désactiver."
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
            Enregistrer les réglages
          </Button>
        </div>
      </form>

      <Card className="mt-6 max-w-lg">
        <h2 className="flex items-center gap-2 text-[0.6rem] tracking-luxe text-gold">
          <KeyRound className="size-3.5" strokeWidth={1.5} />
          Mot de passe
        </h2>
        <p className="mt-2 text-xs text-muted">
          En le changeant, toutes les sessions ouvertes sont fermées — y compris
          celle-ci.
        </p>

        <form onSubmit={handlePassword} className="mt-5 space-y-5">
          <Field label="Mot de passe actuel" required>
            <input
              required
              type="password"
              value={current}
              autoComplete="current-password"
              onChange={(e) => setCurrent(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Nouveau mot de passe" required hint="8 caractères minimum">
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
          <Field label="Confirmer le nouveau mot de passe" required>
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
            Changer le mot de passe
          </Button>
        </form>
      </Card>
    </>
  );
}
