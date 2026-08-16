import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/auth";
import { slugify } from "./lib/slug";

/** Public — only what the storefront should see. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return Promise.all(
      rows
        .sort((a, b) => a.order - b.order)
        .map(async (c) => ({
          ...c,
          imageUrl: c.image ? await ctx.storage.getUrl(c.image) : null,
        })),
    );
  },
});

export const listAll = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx.db, token);
    const rows = await ctx.db.query("categories").collect();
    const products = await ctx.db.query("products").collect();

    return Promise.all(
      rows
        .sort((a, b) => a.order - b.order)
        .map(async (c) => ({
          ...c,
          imageUrl: c.image ? await ctx.storage.getUrl(c.image) : null,
          productCount: products.filter((p) => p.categoryId === c._id).length,
        })),
    );
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    nameAr: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { token, name, ...rest }) => {
    await requireAdmin(ctx.db, token);

    const existing = await ctx.db.query("categories").collect();
    const slug = await uniqueSlug(ctx, name, null);

    return await ctx.db.insert("categories", {
      name,
      slug,
      nameAr: rest.nameAr,
      description: rest.description,
      image: rest.image,
      order: existing.length,
      isActive: rest.isActive ?? true,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("categories"),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
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

/**
 * Refuses while products still point at the category, rather than silently
 * orphaning them.
 */
export const remove = mutation({
  args: { token: v.string(), id: v.id("categories") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx.db, token);

    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", id))
      .collect();

    if (products.length > 0) {
      throw new Error(
        `This category still holds ${products.length} product(s). Move or delete them first.`,
      );
    }

    const category = await ctx.db.get(id);
    if (category?.image) await ctx.storage.delete(category.image);
    await ctx.db.delete(id);
    return null;
  },
});

export const reorder = mutation({
  args: { token: v.string(), ids: v.array(v.id("categories")) },
  handler: async (ctx, { token, ids }) => {
    await requireAdmin(ctx.db, token);
    await Promise.all(ids.map((id, index) => ctx.db.patch(id, { order: index })));
    return null;
  },
});

async function uniqueSlug(
  ctx: MutationCtx,
  name: string,
  ignoreId: Id<"categories"> | null,
): Promise<string> {
  const base = slugify(name);
  const rows = await ctx.db.query("categories").collect();
  const taken = new Set(
    rows.filter((r) => r._id !== ignoreId).map((r) => r.slug),
  );

  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
