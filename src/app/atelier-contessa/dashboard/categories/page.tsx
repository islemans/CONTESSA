"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useAdminSession } from "@/lib/admin-session";
import { cleanConvexError } from "@/lib/errors";
import { useI18n } from "@/lib/i18n/provider";
import {
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  TableSkeleton,
  Toggle,
  fieldClass,
} from "@/components/admin/ui";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";

type Draft = {
  id: Id<"categories"> | null;
  name: string;
  nameAr: string;
  description: string;
  image: UploadedImage[];
  isActive: boolean;
};

const BLANK: Draft = {
  id: null,
  name: "",
  nameAr: "",
  description: "",
  image: [],
  isActive: true,
};

export default function CategoriesPage() {
  const { t } = useI18n();
  const { token } = useAdminSession();
  const categories = useQuery(api.categories.listAll, token ? { token } : "skip");
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || !token || saving) return;

    setSaving(true);
    try {
      const image = draft.image[0]?.storageId;
      if (draft.id) {
        await updateCategory({
          token,
          id: draft.id,
          name: draft.name,
          nameAr: draft.nameAr || undefined,
          description: draft.description || undefined,
          image,
          isActive: draft.isActive,
        });
        toast.success(t("a.categories.updated"));
      } else {
        await createCategory({
          token,
          name: draft.name,
          nameAr: draft.nameAr || undefined,
          description: draft.description || undefined,
          image,
          isActive: draft.isActive,
        });
        toast.success(t("a.categories.created"));
      }
      setDraft(null);
    } catch (error) {
      toast.error(cleanConvexError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: Id<"categories">, name: string) => {
    if (!token) return;
    if (!confirm(t("a.categories.confirmDelete", { name }))) return;

    try {
      await removeCategory({ token, id });
      toast.success(t("a.categories.deleted"));
    } catch (error) {
      // The server refuses while products still reference it.
      toast.error(cleanConvexError(error));
    }
  };

  const toggleActive = async (id: Id<"categories">, isActive: boolean) => {
    if (!token) return;
    try {
      await updateCategory({ token, id, isActive: !isActive });
    } catch (error) {
      toast.error(cleanConvexError(error));
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={t("a.nav.atelier")}
        title={t("a.nav.categories")}
        description={t("a.categories.description")}
        action={
          <Button onClick={() => setDraft(BLANK)}>
            <Plus className="size-3.5" strokeWidth={2} />
            {t("a.categories.new")}
          </Button>
        }
      />

      {categories === undefined ? (
        <TableSkeleton rows={3} />
      ) : categories.length === 0 ? (
        <EmptyState
          title={t("a.categories.none")}
          body={t("a.categories.noneBody")}
          action={
            <Button onClick={() => setDraft(BLANK)}>
              <Plus className="size-3.5" strokeWidth={2} />
              {t("a.categories.new")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category._id} className="flex gap-4">
              <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-md bg-bg">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center font-display text-2xl text-gold/40">
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="truncate font-display text-lg text-ink">
                    {category.name}
                  </p>
                  {category.nameAr && (
                    <p className="truncate text-xs text-muted">{category.nameAr}</p>
                  )}
                  <p className="mt-1 text-[0.6rem] tracking-luxe-sm text-gold">
                    {t("a.categories.productCount", {
                      n: category.productCount,
                    })}
                  </p>
                </div>

                <div className="mt-3 flex gap-1">
                  <button
                    type="button"
                    onClick={() => toggleActive(category._id, category.isActive)}
                    aria-label={
                      category.isActive
                        ? t("a.products.hide")
                        : t("a.products.publish")
                    }
                    title={
                      category.isActive
                        ? t("a.categories.visible")
                        : t("a.categories.hidden")
                    }
                    className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:text-accent"
                  >
                    {category.isActive ? (
                      <Eye className="size-4" strokeWidth={1.5} />
                    ) : (
                      <EyeOff className="size-4" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        id: category._id,
                        name: category.name,
                        nameAr: category.nameAr ?? "",
                        description: category.description ?? "",
                        image: category.image && category.imageUrl
                          ? [{ storageId: category.image, url: category.imageUrl }]
                          : [],
                        isActive: category.isActive,
                      })
                    }
                    aria-label={t("a.edit")}
                    className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:text-accent"
                  >
                    <Pencil className="size-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category._id, category.name)}
                    aria-label={t("a.delete")}
                    className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:text-red-500"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDraft(null)}
            />

            <motion.form
              onSubmit={handleSave}
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface p-6 sm:max-w-lg sm:rounded-2xl"
            >
              <h2 className="font-display text-2xl text-ink">
                {draft.id
                  ? t("a.categories.editTitle")
                  : t("a.categories.new")}
              </h2>

              <div className="mt-6 space-y-5">
                <Field label={t("a.categories.name")} required>
                  <input
                    required
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder={t("a.categories.namePlaceholder")}
                    className={fieldClass}
                  />
                </Field>

                <Field label={t("a.categories.nameAr")} hint={t("a.optional")}>
                  <input
                    dir="rtl"
                    value={draft.nameAr}
                    onChange={(e) => setDraft({ ...draft, nameAr: e.target.value })}
                    placeholder={t("a.categories.nameArPlaceholder")}
                    className={fieldClass}
                  />
                </Field>

                <Field label={t("a.product.description")} hint={t("a.optional")}>
                  <textarea
                    rows={3}
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                    className={`${fieldClass} resize-none`}
                  />
                </Field>

                <ImageUploader
                  label={t("a.categories.cover")}
                  hint={t("a.categories.coverHint")}
                  value={draft.image}
                  onChange={(image) => setDraft({ ...draft, image })}
                />

                <div className="border-t border-line pt-5">
                  <Toggle
                    checked={draft.isActive}
                    onChange={(isActive) => setDraft({ ...draft, isActive })}
                    label={t("a.categories.visible")}
                    hint={t("a.categories.visibleHint")}
                  />
                </div>
              </div>

              <div className="mt-7 flex gap-3">
                <Button type="submit" loading={saving} className="flex-1">
                  {draft.id ? t("a.save") : t("a.create")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDraft(null)}
                >
                  {t("a.cancel")}
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
