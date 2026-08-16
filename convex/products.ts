import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/auth";
import { slugify } from "./lib/slug";

/** Attaches signed storage URLs and the parent category to a raw product row. */
async function decorate(ctx: QueryCtx, product: Doc<"products">) {
  const category = await ctx.db.get(product.categoryId);
  return {
    ...product,
    coverUrl: product.cover ? await ctx.storage.getUrl(product.cover) : null,
    galleryUrls: (
      await Promise.all(product.gallery.map((id) => ctx.storage.getUrl(id)))
    ).filter((url): url is string => url !== null),
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
  };
}

export const list = query({
  args: {
    categorySlug: v.optional(v.string()),
    featuredOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { categorySlug, featuredOnly, limit }) => {
    let rows = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (categorySlug) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
        .unique();
      if (!category) return [];
      rows = rows.filter((p) => p.categoryId === category._id);
    }

    if (featuredOnly) rows = rows.filter((p) => p.isFeatured);

    rows.sort((a, b) => a.order - b.order || b._creationTime - a._creationTime);
    if (limit) rows = rows.slice(0, limit);

    return Promise.all(rows.map((p) => decorate(ctx, p)));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!product || !product.isActive) return null;
    return decorate(ctx, product);
  },
});

/** Same category, excluding the product being viewed. */
export const related = query({
  args: { slug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { slug, limit = 4 }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!product) return [];

    const siblings = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", product.categoryId))
      .collect();

    const picks = siblings
      .filter((p) => p.isActive && p._id !== product._id)
      .slice(0, limit);

    return Promise.all(picks.map((p) => decorate(ctx, p)));
  },
});

export const search = query({
  args: { term: v.string() },
  handler: async (ctx, { term }) => {
    const needle = term.trim().toLowerCase();
    if (needle.length < 2) return [];

    const rows = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const hits = rows
      .filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.description ?? "").toLowerCase().includes(needle),
      )
      .slice(0, 12);

    return Promise.all(hits.map((p) => decorate(ctx, p)));
  },
});

export const listAll = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx.db, token);
    const rows = await ctx.db.query("products").collect();
    rows.sort((a, b) => b._creationTime - a._creationTime);
    return Promise.all(rows.map((p) => decorate(ctx, p)));
  },
});

export const getById = query({
  args: { token: v.optional(v.string()), id: v.id("products") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx.db, token);
    const product = await ctx.db.get(id);
    return product ? decorate(ctx, product) : null;
  },
});

const productFields = {
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.id("categories"),
  price: v.number(),
  compareAtPrice: v.optional(v.number()),
  cover: v.optional(v.id("_storage")),
  gallery: v.optional(v.array(v.id("_storage"))),
  sizes: v.optional(v.array(v.string())),
  colors: v.optional(
    v.array(v.object({ name: v.string(), hex: v.string() })),
  ),
  stock: v.optional(v.number()),
  trackStock: v.optional(v.boolean()),
  isActive: v.optional(v.boolean()),
  isFeatured: v.optional(v.boolean()),
};

export const create = mutation({
  args: { token: v.string(), ...productFields },
  handler: async (ctx, { token, name, ...rest }) => {
    await requireAdmin(ctx.db, token);
    if (rest.price < 0) throw new Error("Price cannot be negative.");

    const count = (await ctx.db.query("products").collect()).length;

    return await ctx.db.insert("products", {
      name,
      slug: await uniqueSlug(ctx, name, null),
      description: rest.description,
      categoryId: rest.categoryId,
      price: Math.round(rest.price),
      compareAtPrice: rest.compareAtPrice
        ? Math.round(rest.compareAtPrice)
        : undefined,
      cover: rest.cover,
      gallery: rest.gallery ?? [],
      sizes: rest.sizes ?? [],
      colors: rest.colors ?? [],
      stock: rest.stock ?? 0,
      trackStock: rest.trackStock ?? false,
      isActive: rest.isActive ?? true,
      isFeatured: rest.isFeatured ?? false,
      order: count,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    cover: v.optional(v.id("_storage")),
    gallery: v.optional(v.array(v.id("_storage"))),
    sizes: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.object({ name: v.string(), hex: v.string() }))),
    stock: v.optional(v.number()),
    trackStock: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { token, id, ...patch }) => {
    await requireAdmin(ctx.db, token);

    const clean: Record<string, unknown> = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    );
    if (patch.name) clean.slug = await uniqueSlug(ctx, patch.name, id);

    await ctx.db.patch(id, clean);
    return null;
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("products") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx.db, token);

    const product = await ctx.db.get(id);
    if (product) {
      // Storage isn't garbage-collected — drop the images with the row.
      const files = [product.cover, ...product.gallery].filter(
        (f): f is Id<"_storage"> => Boolean(f),
      );
      await Promise.all(files.map((f) => ctx.storage.delete(f)));
    }

    await ctx.db.delete(id);
    return null;
  },
});

/** Quick inline switches from the product table. */
export const toggle = mutation({
  args: {
    token: v.string(),
    id: v.id("products"),
    field: v.union(v.literal("isActive"), v.literal("isFeatured")),
  },
  handler: async (ctx, { token, id, field }) => {
    await requireAdmin(ctx.db, token);
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found.");
    await ctx.db.patch(id, { [field]: !product[field] });
    return null;
  },
});

async function uniqueSlug(
  ctx: MutationCtx,
  name: string,
  ignoreId: Id<"products"> | null,
): Promise<string> {
  const base = slugify(name);
  const rows = await ctx.db.query("products").collect();
  const taken = new Set(rows.filter((r) => r._id !== ignoreId).map((r) => r.slug));

  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
