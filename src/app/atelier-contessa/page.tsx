"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { KeyRound, Loader2, Lock } from "lucide-react";
import { api } from "@cvx/_generated/api";
import { Logo } from "@/components/storefront/logo";
import { useAdminSession } from "@/lib/admin-session";
import { ADMIN_PATH } from "@/lib/admin-path";
import { cleanConvexError } from "@/lib/errors";

export default function AtelierGatePage() {
  const router = useRouter();
  const { authenticated, signIn } = useAdminSession();
  const needsSetup = useQuery(api.admin.needsSetup, {});
  const login = useMutation(api.admin.login);
  const setupPassword = useMutation(api.admin.setupPassword);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authenticated) router.replace(`${ADMIN_PATH}/dashboard`);
  }, [authenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    if (needsSetup && password !== confirm) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setBusy(true);
    try {
      const token = needsSetup
        ? await setupPassword({ password })
        : await login({ password });
      signIn(token);
      router.replace(`${ADMIN_PATH}/dashboard`);
    } catch (error) {
      toast.error(cleanConvexError(error));
      setPassword("");
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <Logo variant="full" className="mx-auto w-36" priority />

        <div className="surface-card mt-8 p-7">
          <div className="flex items-center gap-2.5">
            {needsSetup ? (
              <KeyRound className="size-4 text-gold" strokeWidth={1.5} />
            ) : (
              <Lock className="size-4 text-gold" strokeWidth={1.5} />
            )}
            <h1 className="text-[0.65rem] tracking-luxe text-gold">
              {needsSetup ? "Première visite" : "Atelier privé"}
            </h1>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            {needsSetup
              ? "Choisissez le mot de passe qui protégera votre tableau de bord. Notez-le bien — il n'est stocké nulle part en clair."
              : "Entrez votre mot de passe pour accéder au tableau de bord."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[0.6rem] tracking-luxe-sm text-muted">
                Mot de passe
              </span>
              <input
                required
                autoFocus
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={needsSetup ? 8 : undefined}
                autoComplete={needsSetup ? "new-password" : "current-password"}
                className="w-full rounded-[var(--c-radius)] border border-line bg-bg px-4 py-3 text-sm text-ink transition-colors focus:border-gold focus:outline-none"
              />
            </label>

            {needsSetup && (
              <label className="block">
                <span className="mb-2 block text-[0.6rem] tracking-luxe-sm text-muted">
                  Confirmer le mot de passe
                </span>
                <input
                  required
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-[var(--c-radius)] border border-line bg-bg px-4 py-3 text-sm text-ink transition-colors focus:border-gold focus:outline-none"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={busy || needsSetup === undefined}
              className="btn-gold flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[0.65rem] tracking-luxe-sm disabled:opacity-60"
            >
              {busy && <Loader2 className="size-3.5 animate-spin" />}
              {needsSetup ? "Créer mon accès" : "Entrer"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[0.6rem] tracking-luxe-sm text-muted">
          Contessa · Espace propriétaire
        </p>
      </motion.div>
    </div>
  );
}
