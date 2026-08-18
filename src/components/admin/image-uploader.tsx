"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useAdminSession } from "@/lib/admin-session";
import { useI18n } from "@/lib/i18n/provider";
import { cleanConvexError } from "@/lib/errors";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type UploadedImage = { storageId: Id<"_storage">; url: string };

/**
 * Uploads straight from the device to Convex storage.
 *
 * The file never passes through a Next.js route: Convex hands back a one-shot
 * upload URL, the browser POSTs the bytes there, and only the resulting id
 * comes back to be saved on the product.
 */
export function ImageUploader({
  value,
  onChange,
  multiple = false,
  label,
  hint,
}: {
  value: UploadedImage[];
  onChange: (next: UploadedImage[]) => void;
  multiple?: boolean;
  label: string;
  hint?: string;
}) {
  const { t } = useI18n();
  const { token } = useAdminSession();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !token) return;

    const chosen = Array.from(files).slice(0, multiple ? 12 : 1);
    const valid = chosen.filter((file) => {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(t("a.upload.unsupported", { name: file.name }));
        return false;
      }
      if (file.size > MAX_BYTES) {
        toast.error(t("a.upload.tooBig", { name: file.name }));
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;

    setUploading(valid.length);
    try {
      const uploaded = await Promise.all(
        valid.map(async (file) => {
          const uploadUrl = await generateUploadUrl({ token });
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!response.ok) {
            throw new Error(t("a.upload.failed", { name: file.name }));
          }
          const { storageId } = (await response.json()) as {
            storageId: Id<"_storage">;
          };
          return { storageId, url: URL.createObjectURL(file) };
        }),
      );

      onChange(multiple ? [...value, ...uploaded] : uploaded);
      toast.success(
        uploaded.length === 1
          ? t("a.upload.photoAdded")
          : t("a.upload.photosAdded", { n: uploaded.length }),
      );
    } catch (error) {
      toast.error(cleanConvexError(error));
    } finally {
      setUploading(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    // Only detaches it here; the stored file is cleaned up when the product
    // is saved or deleted.
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p className="mb-2 text-[0.6rem] tracking-luxe-sm text-muted">{label}</p>

      <div
        className={cn(
          "grid gap-3",
          multiple ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3",
        )}
      >
        <AnimatePresence initial={false}>
          {value.map((image, index) => (
            <motion.div
              key={image.storageId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-[var(--c-radius)] border border-line bg-bg"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="200px"
                unoptimized={image.url.startsWith("blob:")}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={t("a.upload.removePhoto")}
                className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3.5" strokeWidth={2} />
              </button>
              {index === 0 && multiple && (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[0.55rem] text-white">
                  {t("a.upload.first")}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {(multiple || value.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading > 0}
            className="grid aspect-[3/4] place-items-center rounded-[var(--c-radius)] border border-dashed border-line text-muted transition-colors hover:border-gold hover:text-accent disabled:opacity-50"
          >
            {uploading > 0 ? (
              <span className="flex flex-col items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-[0.55rem]">{uploading}…</span>
              </span>
            ) : (
              <span className="flex flex-col items-center gap-2 px-2 text-center">
                <ImagePlus className="size-5" strokeWidth={1.5} />
                <span className="text-[0.55rem] tracking-luxe-sm">
                  {t("a.upload.add")}
                </span>
              </span>
            )}
          </button>
        )}
      </div>

      {hint && <p className="mt-2 text-[0.65rem] text-muted">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple={multiple}
        onChange={(event) => handleFiles(event.target.files)}
        className="hidden"
      />
    </div>
  );
}
