"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { ChevronLeft, Plus, X } from "lucide-react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useAdminSession } from "@/lib/admin-session";
import { ADMIN_PATH } from "@/lib/admin-path";
import { cleanConvexError } from "@/lib/errors";
import {
  Button,
  Card,
  Field,
  PageHeader,
  Toggle,
  fieldClass,
} from "@/components/admin/ui";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { useI18n } from "@/lib/i18n/provider";

/** Common sizes, one tap each — typing them out every time gets old fast. */
const SIZE_PRESETS = [
  ["XS", "S", "M", "L", "XL", "XXL"],
  ["36", "38", "40", "42", "44", "46"],
];

export default function ProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, money } = useI18n();
  const { token } = useAdminSession();
  const isNew = id === "new";

  const categories = useQuery(api.categories.listAll, token ? { token } : "skip");
  const existing = useQuery(
    api.products.getById,
    !isNew && token ? { token, id: id as Id<"products"> } : "skip",
  );

  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [cover, setCover] = useState<UploadedImage[]>([]);
  const [gallery, setGallery] = useState<UploadedImage[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#B5715A");
  const [trackStock, setTrackStock] = useState(false);
  const [stock, setStock] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  // Populate once the existing product arrives.
  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setDescription(existing.description ?? "");
    setCategoryId(existing.categoryId);
    setPrice(String(existing.price));
    setCompareAtPrice(existing.compareAtPrice ? String(existing.compareAtPrice) : "");
    setCover(
      existing.cover && existing.coverUrl
        ? [{ storageId: existing.cover, url: existing.coverUrl }]
        : [],
    );
    setGallery(
      existing.gallery.map((storageId, index) => ({
        storageId,
        url: existing.galleryUrls[index],
      })).filter((image) => Boolean(image.url)),
    );
    setSizes(existing.sizes);
    setColors(existing.colors);
    setTrackStock(existing.trackStock);
    setStock(String(existing.stock));
    setIsActive(existing.isActive);
    setIsFeatured(existing.isFeatured);
  }, [existing]);

  // Default to the first category so the select is never left empty.
  useEffect(() => {
    if (isNew && !categoryId && categories && categories.length > 0) {
      setCategoryId(categories[0]._id);
    }
  }, [isNew, categoryId, categories]);

  const base = `${ADMIN_PATH}/dashboard/products`;

  const addSize = (value: string) => {
    const clean = value.trim().toUpperCase();
    if (clean && !sizes.includes(clean)) setSizes([...sizes, clean]);
    setSizeInput("");
  };

  const addColor = () => {
    const clean = colorName.trim();
    if (!clean) {
      toast.error(t("a.product.colourNeedsName"));
      return;
    }
    if (colors.some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      toast.error(t("a.product.colourExists"));
      return;
    }
    setColors([...colors, { name: clean, hex: colorHex }]);
    setColorName("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || saving) return;

    if (!categoryId) {
      toast.error(t("a.product.needCategory"));
      return;
    }

    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast.error(t("a.product.invalidPrice"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        description: description || undefined,
        categoryId: categoryId as Id<"categories">,
        price: priceValue,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        cover: cover[0]?.storageId,
        gallery: gallery.map((image) => image.storageId),
        sizes,
        colors,
        stock: Number(stock) || 0,
        trackStock,
        isActive,
        isFeatured,
      };

      if (isNew) {
        await createProduct({ token, ...payload });
        toast.success(t("a.product.created"));
      } else {
        await updateProduct({ token, id: id as Id<"products">, ...payload });
        toast.success(t("a.product.saved"));
      }
      router.push(base);
    } catch (error) {
      toast.error(cleanConvexError(error));
      setSaving(false);
    }
  };

  const noCategories = categories && categories.length === 0;

  return (
    <form onSubmit={handleSubmit}>
      <Link
        href={base}
        className="inline-flex items-center gap-1.5 text-[0.6rem] tracking-luxe-sm text-muted transition-colors hover:text-accent"
      >
        <ChevronLeft className="size-3.5 rtl:rotate-180" />
        {t("a.nav.products")}
      </Link>

      <PageHeader
        eyebrow={t("a.nav.atelier")}
        title={isNew ? t("a.product.newTitle") : t("a.product.editTitle")}
      />

      {noCategories && (
        <Card className="mb-6 border-gold/50">
          <p className="text-sm text-ink">
            {t("a.product.noCategoryWarning")}
          </p>
          <Link href={`${ADMIN_PATH}/dashboard/categories`}>
            <Button className="mt-4">{t("a.product.createCategory")}</Button>
          </Link>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-[0.6rem] tracking-luxe text-gold">
              {t("a.product.essential")}
            </h2>
            <div className="mt-5 space-y-5">
              <Field label={t("a.product.name")} required>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("a.product.namePlaceholder")}
                  className={fieldClass}
                />
              </Field>

              <Field label={t("a.product.category")} required>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">{t("a.product.choose")}</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={t("a.product.description")}>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("a.product.descriptionPlaceholder")}
                  className={`${fieldClass} resize-none`}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t("a.product.price")} required>
                  <input
                    required
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2500"
                    className={fieldClass}
                  />
                </Field>

                <Field
                  label={t("a.product.comparePrice")}
                  hint={t("a.product.comparePriceHint")}
                >
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="3200"
                    className={fieldClass}
                  />
                </Field>
              </div>

              {price && compareAtPrice && Number(compareAtPrice) > Number(price) && (
                <p className="text-xs text-accent">
                  {t("a.product.discountPreview", {
                    percent: Math.round(
                      ((Number(compareAtPrice) - Number(price)) /
                        Number(compareAtPrice)) *
                        100,
                    ),
                    now: money(Number(price)),
                    was: money(Number(compareAtPrice)),
                  })}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-[0.6rem] tracking-luxe text-gold">
              {t("a.product.photos")}
            </h2>
            <div className="mt-5 space-y-6">
              <ImageUploader
                label={t("a.product.cover")}
                hint={t("a.product.coverHint")}
                value={cover}
                onChange={setCover}
              />
              <ImageUploader
                label={t("a.product.gallery")}
                hint={t("a.product.galleryHint")}
                multiple
                value={gallery}
                onChange={setGallery}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-[0.6rem] tracking-luxe text-gold">
              {t("a.product.sizesColours")}
            </h2>

            <div className="mt-5">
              <p className="mb-2 text-[0.6rem] tracking-luxe-sm text-muted">
                {t("a.product.sizes")}
              </p>

              {sizes.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <span
                      key={size}
                      className="flex items-center gap-1.5 rounded-full border border-accent bg-accent/10 py-1.5 pl-3.5 pr-2 text-xs text-ink"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => setSizes(sizes.filter((s) => s !== size))}
                        aria-label={t("a.product.remove", { name: size })}
                        className="grid size-4 place-items-center rounded-full text-muted hover:text-accent"
                      >
                        <X className="size-3" strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // Enter adds a size instead of submitting the whole form.
                      e.preventDefault();
                      addSize(sizeInput);
                    }
                  }}
                  placeholder={t("a.product.sizePlaceholder")}
                  className={fieldClass}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => addSize(sizeInput)}
                >
                  <Plus className="size-3.5" strokeWidth={2} />
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {SIZE_PRESETS.map((preset, index) => (
                  <div key={index} className="flex flex-wrap gap-1.5">
                    {preset.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => addSize(size)}
                        disabled={sizes.includes(size)}
                        className="rounded-full border border-line px-3 py-1 text-[0.65rem] text-muted transition-colors hover:border-gold hover:text-accent disabled:opacity-30"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <p className="mb-2 text-[0.6rem] tracking-luxe-sm text-muted">
                {t("a.product.colours")}
              </p>

              {colors.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <span
                      key={color.name}
                      className="flex items-center gap-2 rounded-full border border-line py-1.5 pl-2 pr-2 text-xs text-ink"
                    >
                      <span
                        className="size-4 rounded-full ring-1 ring-inset ring-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                      <button
                        type="button"
                        onClick={() =>
                          setColors(colors.filter((c) => c.name !== color.name))
                        }
                        aria-label={t("a.product.remove", { name: color.name })}
                        className="grid size-4 place-items-center rounded-full text-muted hover:text-accent"
                      >
                        <X className="size-3" strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  aria-label={t("a.product.tint")}
                  className="h-11 w-14 shrink-0 cursor-pointer rounded-[var(--c-radius)] border border-line bg-bg p-1"
                />
                <input
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addColor();
                    }
                  }}
                  placeholder={t("a.product.colourPlaceholder")}
                  className={fieldClass}
                />
                <Button type="button" variant="ghost" onClick={addColor}>
                  <Plus className="size-3.5" strokeWidth={2} />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <h2 className="text-[0.6rem] tracking-luxe text-gold">
              {t("a.product.publication")}
            </h2>
            <div className="mt-5 space-y-5">
              <Toggle
                checked={isActive}
                onChange={setIsActive}
                label={t("a.product.visible")}
                hint={t("a.product.visibleHint")}
              />
              <Toggle
                checked={isFeatured}
                onChange={setIsFeatured}
                label={t("a.product.featured")}
                hint={t("a.product.featuredHint")}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-[0.6rem] tracking-luxe text-gold">
              {t("a.product.stock")}
            </h2>
            <div className="mt-5 space-y-5">
              <Toggle
                checked={trackStock}
                onChange={setTrackStock}
                label={t("a.product.trackStock")}
                hint={t("a.product.trackStockHint")}
              />
              {trackStock && (
                <Field label={t("a.product.quantity")}>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
              )}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              loading={saving}
              disabled={noCategories}
              className="flex-1"
            >
              {isNew ? t("a.product.createButton") : t("a.save")}
            </Button>
            <Link href={base}>
              <Button type="button" variant="ghost">
                {t("a.cancel")}
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
